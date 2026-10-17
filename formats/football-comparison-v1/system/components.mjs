// All text is supplied by the episode's audited spoken-text cues, never generated here.
export function createComponents({type,colors}){
  const text=(value,x,y,size,fill=colors.ink,maxWidth=936)=>type(value,{x,y,size,fill,maxWidth,anchor:'middle'});
  const headline=(lines,{x=540,y=237,size=76,fill=colors.ink}={})=>lines.map((s,i)=>text(s,x,y+i*88,size,fill));
  const shortHighlight=(lines,opts={})=>headline(lines,{size:72,...opts});
  const sideLabel=(value,x,y,{active=true,color=colors.paper}={})=>({svg:`<g opacity="${active?1:.3}">${text(value,x,y,154,color,210).svg}</g>`,bounds:text(value,x,y,154,color,210).bounds});
  const comparisonLabel=(value,x,y,opts={})=>text(value,x,y,54,opts.fill||colors.ink,opts.maxWidth||400);
  const dataChip=(value,x,y)=>{const t=text(value,x,y,48,colors.ink,280);return{...t,svg:`<rect x="${t.bounds.x-18}" y="${t.bounds.y-8}" width="${t.bounds.width+36}" height="${t.bounds.height+16}" rx="10" fill="${colors.paper}"/>${t.svg}`}};
  const pointer=(a,b,{color=colors.paper,opacity=1,dashed=false,width=4}={})=>`<path d="M${a.x},${a.y} L${b.x},${b.y}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}" ${dashed?'stroke-dasharray="8 12"':''}/>`;
  const focusFrame=(x,y,w,h,{color=colors.left,opacity=1}={})=>`<path d="M${x},${y+20}v-20h20 M${x+w-20},${y}h20v20 M${x+w},${y+h-20}v20h-20 M${x+20},${y+h}h-20v-20" fill="none" stroke="${color}" stroke-width="4" opacity="${opacity}"/>`;
  const smallFactNote=(value,x,y)=>text(value,x,y,38,colors.ink,800);
  const summaryState=(lines,opts={})=>shortHighlight(lines,opts);
  return{headline,shortHighlight,sideLabel,comparisonLabel,dataChip,pointer,focusFrame,smallFactNote,summaryState};
}
