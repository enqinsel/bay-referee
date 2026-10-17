import {type as originalType,getFont} from './typography.mjs';
import {repositoryRoot,assetManifest} from './production.mjs';

export const semanticColor='#E6FF75',semanticInk='#102820';
const cache=new Map();
// Compatibility predicate for the approved editorial slots. New scenes can
// supply isEditorial(options), keeping the treatment without copying a layout.
export const isHeadline=o=>o.x===540&&[240,285,331].includes(o.y)&&o.maxWidth===936&&o.anchor==='middle'&&[64,82,112].includes(o.size)&&!o.font;
export const stripHeadlines=svg=>svg.replace(/<!--typography-begin-->[\s\S]*?<!--typography-end-->/g,'');
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-(1-clamp(x))**3;
function selectedRun(text,word,options,base,context){
 const key=context.root+'|'+text;let run=cache.get(key);if(!run){run=getFont('Archivo',context).layout(text);cache.set(key,run);}
 const index=text.indexOf(word);if(index<0)throw Error('Missing exact word '+word);
 const advance=run.positions.reduce((n,p)=>n+p.xAdvance,0),s=base.bounds.width/advance;
 let character=0,x=0,minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;const selected=[];
 for(let i=0;i<run.glyphs.length;i++){
  const g=run.glyphs[i],p=run.positions[i],length=String.fromCodePoint(...g.codePoints).length;
  if(character>=index&&character<index+word.length){selected.push(`<path d="${g.path.toSVG()}" transform="translate(${x+p.xOffset} ${p.yOffset})"/>`);if(Number.isFinite(g.bbox.minX)){minX=Math.min(minX,x+p.xOffset+g.bbox.minX);maxX=Math.max(maxX,x+p.xOffset+g.bbox.maxX);minY=Math.min(minY,p.yOffset+g.bbox.minY);maxY=Math.max(maxY,p.yOffset+g.bbox.maxY);}}
  character+=length;x+=p.xAdvance;
 }
 if(character!==text.length)throw Error('Unexpected glyph text mapping');
 const bounds={x:base.bounds.x+minX*s,y:options.y-maxY*s,width:(maxX-minX)*s,height:(maxY-minY)*s};
 const glyphs=fill=>`<g fill="${fill}" transform="translate(${base.bounds.x} ${options.y}) scale(${s} ${-s})">${selected.join('')}</g>`;
 return {bounds,glyphs};
}
export function createTypography({plan,time,observations,baseline=false,isEditorial=isHeadline,root=repositoryRoot,manifest=assetManifest}){
 const context={root,manifest};
 return (text,options)=>{
  const base=originalType(text,options,context);if(!isEditorial(options))return base;
  const wrap=svg=>`<!--typography-begin-->${svg}<!--typography-end-->`;
  const event=plan.events.find(e=>time()>=e.start&&time()<e.end&&text.includes(e.active_word_display));
  if(baseline||!event||time()<=event.settle_start)return {...base,svg:wrap(base.svg)};
  const progress=ease((time()-event.settle_start)/(event.settle_end-event.settle_start));
  const run=selectedRun(text,event.active_word_display,options,base,context),b=run.bounds;
  let effectBounds={...b},svg='',key='hl-'+event.id.replace(/[^a-zA-Z0-9]/g,'');
  if(event.treatment==='word_color')svg=`<g opacity="${1-.26*progress}">${base.svg}</g><g opacity="${progress}">${run.glyphs(semanticColor)}</g>`;
  else if(event.treatment==='underline'){
   const y=b.y+b.height+9;effectBounds={x:b.x,y,width:b.width,height:6};
   svg=`<g opacity="${1-.12*progress}">${base.svg}</g><path d="M${b.x},${y+3}H${b.x+b.width*progress}" stroke="${semanticColor}" stroke-opacity=".92" stroke-width="6" fill="none" stroke-linecap="butt"/>`;
  }else if(event.treatment==='hard_marker'){
   const pad=7;effectBounds={x:b.x-pad,y:b.y-7,width:b.width+2*pad,height:b.height+14};const r=effectBounds;
   svg=`${base.svg}<defs><clipPath id="${key}"><rect x="${r.x}" y="${r.y}" width="${r.width*progress}" height="${r.height}"/></clipPath></defs><g clip-path="url(#${key})"><rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${semanticColor}"/>${run.glyphs(semanticInk)}</g>`;
  }else throw Error('Unknown treatment '+event.treatment);
  observations().push({id:event.id,cue_id:event.cue_id,word:event.active_word_display,treatment:event.treatment,color:semanticColor,progress,word_bounds:b,effect_bounds:effectBounds,base_bounds:base.bounds,line:text});
  return {...base,svg:wrap(svg)};
 };
}
