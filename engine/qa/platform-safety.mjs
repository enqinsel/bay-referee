/**
 * Generic browser QA, independent of channel styling and renderer.
 * Pass this exported function directly to Puppeteer page.evaluate(). It has no
 * closure dependencies. Bboxes are normalized to the profile canvas coordinate
 * space; no rounding or pixel tolerance is used for containment decisions.
 */
export function inspectPlatformFrame(options = {}) {
  const profile = options.profile;
  if (!profile?.critical_safe_rect) throw new Error('A resolved safe-zone profile is required');
  const safe = profile.critical_safe_rect;
  const width = options.canvas?.width ?? 1080;
  const height = options.canvas?.height ?? 1920;
  const root = document.querySelector(options.canvasSelector || '[data-composition-id]');
  if (!root) throw new Error('Composition canvas not found');
  const rootRect = root.getBoundingClientRect();
  if (!(rootRect.width > 0 && rootRect.height > 0)) throw new Error('Composition canvas is empty');
  const sx = rootRect.width / width, sy = rootRect.height / height;
  const normalizeRect = r => {
    return { left: (r.left-rootRect.left)/sx, top: (r.top-rootRect.top)/sy,
      right: (r.right-rootRect.left)/sx, bottom: (r.bottom-rootRect.top)/sy,
      width: r.width/sx, height: r.height/sy };
  };
  const rect = el => normalizeRect(el.getBoundingClientRect());
  const visible = (el, requireBox=true) => {
    if (!el || el.closest('[data-qa-debug]')) return false;
    for (let n=el; n && n instanceof Element; n=n.parentElement) {
      const style=getComputedStyle(n);
      if (style.display==='none' || style.visibility==='hidden' || style.visibility==='collapse' || Number(style.opacity)===0 || n.hasAttribute('hidden')) return false;
    }
    const r=el.getBoundingClientRect(); return !requireBox || (r.width>0 && r.height>0);
  };
  const inCanvas = r => r.right>0 && r.bottom>0 && r.left<width && r.top<height;
  const inSafe = r => [r.left,r.top,r.right,r.bottom].every(Number.isFinite) && r.left>=safe.left && r.top>=safe.top && r.right<=safe.right && r.bottom<=safe.bottom;
  const id = (el,i) => el.id || el.getAttribute('data-critical-safe') || el.getAttribute('data-qa-text') || `${el.tagName.toLowerCase()}-${i}`;
  const clean = value => String(value||'').replace(/\s+/g,' ').trim();
  const words = value => (value.match(/[\p{L}\p{N}]+(?:['’.,][\p{L}\p{N}]+)*/gu)||[]).length;
  const intersection = (a,b) => {
    const w=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
    const h=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
    return w*h;
  };
  const union = (a,b) => {
    const left=Math.min(a.left,b.left),top=Math.min(a.top,b.top),right=Math.max(a.right,b.right),bottom=Math.max(a.bottom,b.bottom);
    return {left,top,right,bottom,width:right-left,height:bottom-top};
  };
  const glyphRects = node => {
    // A parent layout box does not contain overflowing nowrap/absolute text.
    // Range measures the actual laid-out text runs (including SVG text), while
    // preserving every fractional pixel through preview normalization.
    const raw=node.nodeValue||'',start=raw.search(/\S/u);
    if(start<0)return [];
    const end=raw.length-(raw.match(/\s*$/u)?.[0].length||0);
    const range=document.createRange();range.setStart(node,start);range.setEnd(node,end);
    return [...range.getClientRects()].filter(r=>r.width>0&&r.height>0).map(normalizeRect);
  };
  const paintState = el => {
    const transparent = value => {
      const v=String(value||'').trim().toLowerCase();
      return v==='none'||v==='transparent'||/^(?:rgba|hsla)\([^)]*,\s*0(?:\.0*)?\s*\)$/.test(v)||/\/\s*0(?:\.0*)?%?\s*\)$/.test(v);
    };
    const style=getComputedStyle(el),svg=el instanceof SVGElement;
    const fillInvisible=svg?(transparent(style.fill)||Number(style.fillOpacity)===0):transparent(style.webkitTextFillColor||style.color);
    const strokeVisible=svg?(!transparent(style.stroke)&&parseFloat(style.strokeWidth)>0&&Number(style.strokeOpacity)>0):(!transparent(style.webkitTextStrokeColor)&&parseFloat(style.webkitTextStrokeWidth)>0);
    const textTransparent=fillInvisible&&!strokeVisible&&(style.textShadow==='none'||!style.textShadow);
    let masked=false,fullyClipped=false;
    for(let n=el;n&&n instanceof Element;n=n.parentElement) {
      const s=getComputedStyle(n),clip=s.clipPath||'none',mask=s.maskImage||s.webkitMaskImage||'none';
      if(clip!=='none'||mask!=='none')masked=true;
      const inset=clip.match(/^inset\(([^)]*)\)$/);
      if(inset) {
        const parts=inset[1].split(/\s+round\s+/)[0].trim().split(/\s+/);
        if(parts.length>=1&&parts.length<=4&&parts.every(p=>/^-?\d+(?:\.\d+)?%$/.test(p))) {
          const v=parts.map(parseFloat),top=v[0],right=v[1]??top,bottom=v[2]??top,left=v[3]??right;
          if(top+bottom>=100||left+right>=100)fullyClipped=true;
        }
      }
      if(/^circle\(0(?:px|%)?(?:\s|\))/.test(clip)||/^ellipse\(0(?:px|%)?\s+0(?:px|%)?(?:\s|\))/.test(clip))fullyClipped=true;
    }
    return {textTransparent,masked,fullyClipped};
  };
  const fontSize = el => {
    let scale=1;
    if (el instanceof SVGElement && typeof el.getScreenCTM==='function') {
      const m=el.getScreenCTM(); if(m) scale=Math.hypot(m.c,m.d)/sy;
    } else {
      let matrix=new DOMMatrix();
      for(let n=el;n && n instanceof Element;n=n.parentElement) {
        const transform=getComputedStyle(n).transform;
        if(transform && transform!=='none') matrix=new DOMMatrix(transform).multiply(matrix);
      }
      scale=Math.hypot(matrix.c,matrix.d)/sy;
    }
    return (parseFloat(getComputedStyle(el).fontSize)||0)*scale;
  };
  const criticalElements = [...root.querySelectorAll('[data-critical-safe]')]
    .filter(el=>visible(el) && !el.hasAttribute('data-qa-background'))
    .map((el,i)=>({ id:id(el,i), tag:el.tagName.toLowerCase(), text:clean(el.textContent), bbox:rect(el), pass:inSafe(rect(el)) }));
  const violations=criticalElements.filter(v=>!v.pass).map(v=>({...v,code:'CRITICAL_SAFE_ZONE_VIOLATION'}));
  const groupMap=new Map();
  const paintWarnings=new Map();
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())) {
    const text=clean(node.nodeValue), el=node.parentElement;
    if(!text || !el || el.closest('script,style,noscript,title,desc,[data-qa-debug]') || !visible(el,false)) continue;
    const criticalTagged=Boolean(el.closest('[data-critical-safe]'));
    const paint=paintState(el);
    if(criticalTagged&&(paint.textTransparent||paint.masked)) {
      const code=paint.textTransparent||paint.fullyClipped?'CRITICAL_TEXT_NOT_PAINTED':'MASKED_CRITICAL_TEXT_REVIEW';
      const key=`${code}:${id(el,paintWarnings.size)}:${text}`;
      paintWarnings.set(key,{code,id:id(el,paintWarnings.size),text,reason:paint.textTransparent?'transparent text without visible stroke/shadow':paint.fullyClipped?'fully clipped text':'clipped/masked critical text needs visual confirmation',requires_human_review:true});
    }
    if(paint.textTransparent||paint.fullyClipped)continue;
    const runs=glyphRects(node);if(!runs.length)continue;
    const bbox=runs.reduce(union);
    // Marked text that has escaped even the whole canvas must still fail.
    if(!inCanvas(bbox) && !criticalTagged)continue;
    const explicit=el.closest('[data-text-group]');
    const owner=explicit || el.closest('[data-qa-text]') || el;
    const key=explicit?.getAttribute('data-text-group') || owner;
    let group=groupMap.get(key);
    if(!group) {
      group={ id:typeof key==='string' ? key : id(owner,groupMap.size), text:'', bbox, layout_bbox:rect(el), glyph_rects:[], largest_font_px:0, elements:[], critical_tagged:true };
      groupMap.set(key,group);
    }
    group.text=clean(`${group.text} ${text}`); group.bbox=union(group.bbox,bbox);
    group.layout_bbox=union(group.layout_bbox,rect(el));group.glyph_rects.push(...runs);
    group.largest_font_px=Math.max(group.largest_font_px,fontSize(el));
    group.critical_tagged=group.critical_tagged && criticalTagged;
    group.elements.push(id(el,group.elements.length));
  }
  const textGroups=[...groupMap.values()].map(g=>({...g,word_count:words(g.text),safe_zone_pass:inSafe(g.bbox)}));
  // Visible text without a semantic critical tag is surfaced, never silently
  // treated as safe. A background image may bleed; its raster text isn't DOM UI.
  for(const group of textGroups.filter(g=>!g.critical_tagged)) violations.push({code:'UNTAGGED_VISIBLE_TEXT',id:group.id,text:group.text,bbox:group.bbox,pass:false});
  // Ancestor critical tags establish semantics, never geometric exemptions.
  // This catches child text escaping an in-bounds parent and glyph overflow
  // that getBoundingClientRect() on the text's layout element cannot expose.
  for(const group of textGroups.filter(g=>!g.safe_zone_pass)) violations.push({code:'TEXT_SAFE_ZONE_VIOLATION',id:group.id,text:group.text,bbox:group.bbox,pass:false});
  const overlaps=[];
  for(let i=0;i<textGroups.length;i++) for(let j=i+1;j<textGroups.length;j++) {
    const a=textGroups[i],b=textGroups[j],area=intersection(a.bbox,b.bbox);
    if(area>0) overlaps.push({a:a.id,b:b.id,intersection_area_px2:area,smaller_group_covered_fraction:area/Math.min(a.bbox.width*a.bbox.height,b.bbox.width*b.bbox.height)});
  }
  const wordCount=textGroups.reduce((sum,g)=>sum+g.word_count,0);
  const largestFont=Math.max(0,...textGroups.map(g=>g.largest_font_px));
  const warnings=[...paintWarnings.values()];
  if(wordCount>=14 && textGroups.length>=3) warnings.push({code:'TEXT_DENSITY_WARNING',word_count:wordCount,text_group_count:textGroups.length,requires_human_review:true});
  if(largestFont>(options.fontCapPx??170)) warnings.push({code:'FONT_CAP_WARNING',largest_font_px:largestFont,cap_px:options.fontCapPx??170,requires_human_review:true});
  if(overlaps.length) warnings.push({code:'TEXT_OVERLAP_WARNING',pairs:overlaps.length,requires_human_review:true});
  const safePass=violations.length===0;
  return {schema_version:'1.0',time:options.time??null,profile:profile.id,profile_authority:profile.authority,
    canvas:{width,height},safe_rect:safe,tolerance_px:0,critical_elements:criticalElements,critical_element_count:criticalElements.length,
    violations,safe_zone_pass:safePass,text_groups:textGroups,text_group_count:textGroups.length,word_count:wordCount,
    largest_font_px:largestFont,overlaps,warnings,requires_human_review:warnings.length>0,
    status:!safePass?'FAIL':warnings.length?'REVIEW_REQUIRED':'PASS'};
}

/** Add/remove a QA-only SVG overlay. Never called by a final render path. */
export function setPlatformDebugOverlay(options = {}) {
  const root=document.querySelector(options.canvasSelector||'[data-composition-id]');
  if(!root) throw new Error('Composition canvas not found');
  root.querySelector('[data-qa-debug="platform-safe-zone"]')?.remove();
  if(options.enabled===false) return false;
  const profile=options.profile, r=profile?.critical_safe_rect;
  if(!r) throw new Error('A resolved safe-zone profile is required');
  const width=options.canvas?.width??1080,height=options.canvas?.height??1920;
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('data-qa-debug','platform-safe-zone');svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  svg.setAttribute('aria-hidden','true');
  Object.assign(svg.style,{position:'absolute',left:'0',top:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'2147483647'});
  const path=document.createElementNS(ns,'path');
  path.setAttribute('d',`M0 0H${width}V${height}H0Z M${r.left} ${r.top}V${r.bottom}H${r.right}V${r.top}Z`);
  path.setAttribute('fill','#eb344f');path.setAttribute('fill-opacity','.20');path.setAttribute('fill-rule','evenodd');svg.append(path);
  const boundary=document.createElementNS(ns,'rect');
  for(const [k,v] of Object.entries({x:r.left,y:r.top,width:r.right-r.left,height:r.bottom-r.top,fill:'none',stroke:'#3dffb2','stroke-width':4,'stroke-dasharray':'14 8'})) boundary.setAttribute(k,String(v));
  svg.append(boundary); root.append(svg);return true;
}
