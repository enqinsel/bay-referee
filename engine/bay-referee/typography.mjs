import * as fontkit from 'fontkit';
import {loadAssetBytes,repositoryRoot,assetManifest,captionStyle} from './production.mjs';

const fontCache=new Map(),glyphCache=new Map();
export const fontStyles=Object.freeze({Archivo:{asset:'font-archivo',axes:{wght:860,wdth:85}},Label:{asset:'font-archivo',axes:{wght:800,wdth:95}},Caption:{asset:'font-archivo',axes:{wght:820,wdth:65}},Manrope:{asset:'font-manrope',axes:null}});
export function getFont(name='Archivo',{root=repositoryRoot,manifest=assetManifest}={}){
 const style=fontStyles[name];if(!style)throw Error('Unknown approved font style: '+name);
 const record=manifest.assets.find(a=>a.id===style.asset),key=root+'|'+name+'|'+record?.sha256;
 if(!fontCache.has(key)){const face=fontkit.create(loadAssetBytes(style.asset,{root,manifest}));fontCache.set(key,style.axes?face.getVariation(style.axes):face);}
 return fontCache.get(key);
}
function shape(text,name,context){
 const key=(context.root??repositoryRoot)+'|'+name+'|'+text;let r=glyphCache.get(key);
 if(!r){const f=getFont(name,context),run=f.layout(text);let dx=0,svg=[];for(let i=0;i<run.glyphs.length;i++){const g=run.glyphs[i],p=run.positions[i];if(g.id===0)throw Error('Missing glyph '+text);svg.push(`<path d="${g.path.toSVG()}" transform="translate(${dx+p.xOffset} ${p.yOffset})"/>`);dx+=p.xAdvance;}r={svg:svg.join(''),advance:dx,ascent:f.ascent,descent:f.descent,units:f.unitsPerEm};glyphCache.set(key,r);}
 return r;
}
export function measureText(text,{size,font='Archivo'}={},context={}){const r=shape(text,font,context);return {width:r.advance*size/r.units,ascent:r.ascent*size/r.units,descent:r.descent*size/r.units};}
export function type(text,{x,y,size,font='Archivo',fill='#F4F1DA',maxWidth=936,anchor='start'},context={}){
 const r=shape(text,font,context);
 if(font==='Caption'&&r.advance*size/r.units>maxWidth)throw Error('Caption exceeds locked width; re-chunk instead of shrinking');
 const s=Math.min(size/r.units,maxWidth/r.advance),width=r.advance*s,xx=x-(anchor==='middle'?width/2:anchor==='end'?width:0);
 return {svg:`<g fill="${fill}" transform="translate(${xx} ${y}) scale(${s} ${-s})">${r.svg}</g>`,bounds:{x:xx,y:y-r.ascent*s,width,height:(r.ascent-r.descent)*s}};
}
export function captionLine(text,{x=captionStyle.layout.x,y=captionStyle.layout.first_baseline}={},context={}){
 const r=shape(text,'Caption',context),s=captionStyle.font.size_px/r.units,width=r.advance*s;
 if(width>captionStyle.layout.max_width)throw Error('Caption exceeds locked width; re-chunk instead of shrinking');
 return {svg:`<g fill="${captionStyle.fill}" stroke="${captionStyle.contrast.color}" stroke-width="${captionStyle.contrast.width_px/s}" paint-order="stroke fill" stroke-linejoin="round" transform="translate(${x} ${y}) scale(${s} ${-s})">${r.svg}</g>`,bounds:{x,y:y-r.ascent*s,width,height:(r.ascent-r.descent)*s}};
}
