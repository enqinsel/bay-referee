/** Channel-independent phrase grouping. No retiming, rewriting or karaoke. */
export function wrapWords(words, measure, maxWidth) {
 const text=words.join(' ');
 if(measure(text)<=maxWidth)return text;
 let best=null;
 for(let cut=1;cut<words.length;cut++){
  const a=words.slice(0,cut).join(' '),b=words.slice(cut).join(' '),aw=measure(a),bw=measure(b);
  if(aw<=maxWidth&&bw<=maxWidth){const score=Math.abs(aw-bw);if(!best||score<best.score)best={text:a+'\n'+b,score};}
 }
 return best?.text??null;
}
export function groupTimedWords(segments,{measure,maxWidth,maxWords=6,minWords=2,tail=.10}){
 const phrases=[];
 for(const segment of segments){
  let i=0;
  while(i<segment.words.length){
   let chosen=null;
   for(let end=i+1;end<=Math.min(segment.words.length,i+maxWords);end++){
    const remaining=segment.words.length-end;
    if(remaining>0&&remaining<minWords)continue;
    if(end-i<minWords&&segment.words.length-i>=minWords)continue;
    const words=segment.words.slice(i,end);const text=wrapWords(words.map(w=>w.word.trim()),measure,maxWidth);
    if(text)chosen={words,text,end};else break;
   }
   if(!chosen)throw new Error('A single word exceeds caption width: '+segment.words[i].word);
   phrases.push({id:'phrase_'+String(phrases.length+1).padStart(3,'0'),text:chosen.text,start:chosen.words[0].start,rawStart:chosen.words[0].start,rawEnd:chosen.words.at(-1).end,end:chosen.words.at(-1).end,wordRefs:[{segmentId:segment.id,wordIndices:Array.from({length:chosen.end-i},(_,n)=>(segment.wordOffset||0)+i+n)}]});i=chosen.end;
  }
 }
 phrases.forEach((p,i)=>p.end=Math.min(p.rawEnd+tail,phrases[i+1]?.start??p.rawEnd));return phrases;
}
