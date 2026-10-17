/** Browser-observed UI obstruction QA. Full-bleed is never a central box.
 * Text uses actual glyph runs. Semantic objects use authored focal regions or
 * anchors, including transparent QA geometry; no visual inference is claimed. */
export function inspectExclusionFrame(options={}) {
 const profile=options.profile,root=document.querySelector('[data-composition-id]');
 if(!profile?.exclusions||!root)throw Error('Resolved UI-exclusion profile and canvas required');
 const W=options.canvas?.width||1080,H=options.canvas?.height||1920,rr=root.getBoundingClientRect(),sx=rr.width/W,sy=rr.height/H;
 const norm=r=>({left:(r.left-rr.left)/sx,top:(r.top-rr.top)/sy,right:(r.right-rr.left)/sx,bottom:(r.bottom-rr.top)/sy,width:r.width/sx,height:r.height/sy});
 const bounds=el=>norm(el.getBoundingClientRect()),area=r=>Math.max(0,r.right-r.left)*Math.max(0,r.bottom-r.top);
 const intersect=(a,b)=>{const left=Math.max(a.left,b.left),top=Math.max(a.top,b.top),right=Math.min(a.right,b.right),bottom=Math.min(a.bottom,b.bottom);return{left,top,right,bottom,width:Math.max(0,right-left),height:Math.max(0,bottom-top)};};
 const canvas={left:0,top:0,right:W,bottom:H},hard=profile.exclusions.filter(z=>z.severity==='exclude'),caution=profile.exclusions.filter(z=>z.severity==='caution');
 const visible=el=>{for(let n=el;n instanceof Element;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||s.visibility==='collapse'||+s.opacity===0||n.hidden)return false;}return true;};
 const cutsFor=el=>{const clips=[canvas];for(let n=el;n instanceof Element&&n!==root;n=n.parentElement){const s=getComputedStyle(n),b=bounds(n);if(['hidden','clip'].includes(s.overflow)||['hidden','clip'].includes(s.overflowX)||['hidden','clip'].includes(s.overflowY))clips.push(b);const m=s.clipPath.match(/^inset\(([^)]+)\)$/);if(m){const parts=m[1].split(/\s+round\s+/)[0].trim().split(/\s+/);const a=parts.map(v=>({value:parseFloat(v),percent:v.endsWith('%')}));if(a.length&&a.every(v=>Number.isFinite(v.value))){const t=a[0],r=a[1]||t,d=a[2]||t,l=a[3]||r;clips.push({left:b.left+l.value*(l.percent?b.width/100:1/sx),right:b.right-r.value*(r.percent?b.width/100:1/sx),top:b.top+t.value*(t.percent?b.height/100:1/sy),bottom:b.bottom-d.value*(d.percent?b.height/100:1/sy)});}}}return clips;};
 const clipped=(r,el)=>cutsFor(el).reduce(intersect,r);
 const safeArea=r=>{
  // Rectangular exclusions can overlap. Sweep strips to calculate their union.
  const b=intersect(r,canvas);if(!area(b))return 0;const xs=[b.left,b.right,...hard.flatMap(z=>[Math.max(b.left,Math.min(b.right,z.rect.left)),Math.max(b.left,Math.min(b.right,z.rect.right))])].sort((a,b)=>a-b);let covered=0;
  for(let i=1;i<xs.length;i++){const x=(xs[i-1]+xs[i])/2,ys=hard.filter(z=>z.rect.left<x&&z.rect.right>x).map(z=>[Math.max(b.top,z.rect.top),Math.min(b.bottom,z.rect.bottom)]).filter(([a,d])=>d>a).sort((a,b)=>a[0]-b[0]);let n=0,end=-Infinity;for(const[a,d]of ys){n+=Math.max(0,d-Math.max(a,end));end=Math.max(end,d);}covered+=(xs[i]-xs[i-1])*n;}return Math.max(0,area(b)-covered);
 };
 const violations=[],warnings=[],groups=new Map(),semantic=[];let node;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 while((node=walker.nextNode())){
  const el=node.parentElement,text=node.nodeValue.replace(/\s+/g,' ').trim();if(!text||!el||el.closest('script,style,title,desc,noscript,[data-qa-debug]')||!visible(el))continue;
  const style=getComputedStyle(el);const color=el instanceof SVGElement?style.fill:style.webkitTextFillColor||style.color;
  if(color==='none'||color==='transparent'||/rgba\([^)]*,\s*0\)$/.test(color))continue;
  const range=document.createRange();const raw=node.nodeValue,start=raw.search(/\S/),end=raw.length-(raw.match(/\s*$/)?.[0].length||0);range.setStart(node,start);range.setEnd(node,end);
  const rawRects=[...range.getClientRects()].filter(r=>r.width>0&&r.height>0).map(norm),rects=rawRects.map(r=>clipped(r,el)).filter(r=>area(r)>0);if(!rects.length)continue;
  const owner=el.closest('[data-text-group]')||el.closest('[data-qa-text]')||el,key=owner.dataset.textGroup||owner.id||'text-'+groups.size;
  let g=groups.get(key);if(!g){g={id:key,text:'',glyph_rects:[],raw_glyph_rects:[],font_px:0};groups.set(key,g);}g.text=(g.text+' '+text).trim();g.glyph_rects.push(...rects);g.raw_glyph_rects.push(...rawRects);
  let scale=1;if(el instanceof SVGElement&&el.getScreenCTM){const m=el.getScreenCTM();scale=Math.hypot(m.c,m.d)/sy;}else{let m=new DOMMatrix();for(let n=el;n instanceof Element;n=n.parentElement){const t=getComputedStyle(n).transform;if(t!=='none')m=new DOMMatrix(t).multiply(m);}scale=Math.hypot(m.c,m.d)/sy;}g.font_px=Math.max(g.font_px,parseFloat(style.fontSize)*scale);
  if(!el.closest('[data-text-safe]'))violations.push({code:'UNTAGGED_TEXT',id:key,text});
  // Text outside the canvas is not excused by clipping; a deliberate mask reveal
  // is separately recorded and must finish with complete text during review.
  for(const r of rawRects)if(r.left<0||r.top<0||r.right>W||r.bottom>H)violations.push({code:'TEXT_OUTSIDE_CANVAS',id:key,rect:r});
  for(const z of hard)if(rects.some(r=>area(intersect(r,z.rect))>0))violations.push({code:'TEXT_UI_OCCLUSION',id:key,zone:z.id,text});
  for(const z of caution)if(rects.some(r=>area(intersect(r,z.rect))>0))warnings.push({code:'TEXT_UI_CAUTION',id:key,zone:z.id});
 }
 for(const el of root.querySelectorAll('[data-semantic-object]')){
  if(!visible(el)||!area(bounds(el)))continue;
  const id=el.dataset.semanticObject||el.id,regions=[...el.querySelectorAll('[data-semantic-region]')],anchors=[...el.querySelectorAll('[data-semantic-anchor]')],checks=[];
  const reveal=(el.dataset.semanticReveal||'').split(',').map(Number),time=options.time??0;
  const transition=reveal.length===2&&reveal.every(Number.isFinite)&&reveal[1]>reveal[0]&&reveal[1]-reveal[0]<=1&&time>=reveal[0]&&time<reveal[1];
  if(!regions.length&&!anchors.length)violations.push({code:'SEMANTIC_FOCUS_MISSING',id});
  for(const region of regions){const r=bounds(region),painted=clipped(r,el),ratio=area(r)>0?safeArea(painted)/area(r):0,min=Number(region.dataset.minVisible||profile.semantic_policy?.region_min_visible_default||.75);const pass=Number.isFinite(min)&&min>0&&min<=1&&ratio>=min;checks.push({kind:'region',id:region.dataset.semanticRegion,rect:r,visible_ratio:ratio,minimum:min,pass,transition});if(!pass&&!transition)violations.push({code:'SEMANTIC_REGION_OCCLUDED',id,region:region.dataset.semanticRegion,ratio,minimum:min});}
  for(const anchor of anchors){const r=bounds(anchor),point={x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};const b=clipped({left:point.x-.005,right:point.x+.005,top:point.y-.005,bottom:point.y+.005,width:.01,height:.01},el);const pass=area(b)>0&&safeArea(b)>0;checks.push({kind:'anchor',id:anchor.dataset.semanticAnchor,point,pass,transition});if(!pass&&!transition)violations.push({code:'SEMANTIC_ANCHOR_OCCLUDED',id,point});}
  semantic.push({id,object_bbox:bounds(el),whole_bbox_containment_required:false,transition,checks});
 }
 const textGroups=[...groups.values()].map(g=>({...g,word_count:(g.text.match(/[\p{L}\p{N}]+(?:['’.,][\p{L}\p{N}]+)*/gu)||[]).length}));
 const overlaps=[];for(let i=0;i<textGroups.length;i++)for(let j=i+1;j<textGroups.length;j++)if(textGroups[i].glyph_rects.some(a=>textGroups[j].glyph_rects.some(b=>area(intersect(a,b))>0)))overlaps.push([textGroups[i].id,textGroups[j].id]);
 const wordCount=textGroups.reduce((n,g)=>n+g.word_count,0),font=Math.max(0,...textGroups.map(g=>g.font_px));
 if(wordCount>=14&&textGroups.length>=3)warnings.push({code:'TEXT_DENSITY_WARNING',words:wordCount,groups:textGroups.length});
 if(overlaps.length)warnings.push({code:'TEXT_OVERLAP_WARNING',pairs:overlaps});
 if(font>(options.fontReviewCap??220))warnings.push({code:'TEXT_SIZE_REVIEW',font_px:font});
 return{time:options.time??null,model:'ui_exclusion_and_semantic_visibility',profile:profile.id,authority:profile.authority,violations,warnings,text_groups:textGroups,semantic_objects:semantic,word_count:wordCount,text_group_count:textGroups.length,maximum_font_px:font,status:violations.length?'FAIL':warnings.length?'REVIEW_REQUIRED':'PASS'};
}

export function exclusionOverlaySVG(profile,{width=1080,height=1920}={}){
 const colors={exclude:'#e56956',caution:'#eab453'},p=profile.caption_preferred_band;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g font-family="Arial,sans-serif" font-size="24">${profile.exclusions.map(z=>{const r=z.rect;return`<rect x="${r.left}" y="${r.top}" width="${r.right-r.left}" height="${r.bottom-r.top}" fill="${colors[z.severity]}" fill-opacity=".18" stroke="${colors[z.severity]}" stroke-width="2" stroke-dasharray="12 8"/><text x="${r.left+14}" y="${r.top+36}" fill="${colors[z.severity]}" ${z.id==='right-toolbar'?'transform="rotate(90 '+(r.left+14)+' '+(r.top+36)+')"':''}>${z.id==='right-toolbar'?'RIGHT UI • ASSUMPTION':z.id==='bottom-description-audio'?'DESCRIPTION / AUDIO • ASSUMPTION':'TOP UI • CAUTION'}</text>`;}).join('')}<rect x="${p.left}" y="${p.baseline_top}" width="${p.right-p.left}" height="${p.baseline_bottom-p.baseline_top}" fill="#63d1dc" fill-opacity=".10" stroke="#63d1dc" stroke-width="3"/><text x="${p.left+12}" y="${p.baseline_top-15}" fill="#63d1dc">CAPTION BASELINE BAND • PREFERRED</text></g></svg>`;
}
