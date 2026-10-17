/** Soft editorial diagnostic, not a motion quota or an aesthetic score.
 * Author/analyst semantic evidence is explicit; pixel change alone never counts. */
export const meaningfulKinds=Object.freeze(['new_factual_asset','object_enter','object_exit','object_role_change','relationship_change','data_change','graphic_build','route_progress','diagram_change','focus_change','section_transition','text_responsibility_change']);
const decorativeKinds=new Set(['opacity_drift','ambient_float','random_particle','subpixel_movement','decorative_motion']);
const finite=(v,k)=>{if(!Number.isFinite(v))throw new TypeError(k+' must be finite');return v;};
const inside=(v,d)=>v>=0&&v<=d;
const intersects=(a,b)=>a.start<b.end&&b.start<a.end;
function validateSpan(s,d,name,{point=false}={}){
  finite(s.start,name+'.start');finite(s.end,name+'.end');
  if(!inside(s.start,d)||!inside(s.end,d)||s.end<s.start||(!point&&s.end===s.start))throw new RangeError(name+' must be inside the duration');
}
export function analyzeVisualStateDensity(plan,{holdThreshold=2.5,windowSeconds=.25}={}){
  const duration=finite(plan?.duration,'duration');if(duration<=0)throw new RangeError('duration must be positive');
  if(finite(holdThreshold,'holdThreshold')<=0||finite(windowSeconds,'windowSeconds')<=0)throw new RangeError('Positive diagnostic settings required');
  if(!Array.isArray(plan.events))throw new TypeError('events array is required, even when empty');
  const ids=new Set(),accepted=[],ignored=[],unverified=[];
  for(const e of plan.events){
    if(typeof e.id!=='string'||!e.id||ids.has(e.id))throw new TypeError('Unique event IDs required');ids.add(e.id);validateSpan(e,duration,e.id,{point:true});
    if(decorativeKinds.has(e.kind)){ignored.push({...e,reason:'Decorative change cannot reset a meaningful-state hold'});continue;}
    if(!meaningfulKinds.includes(e.kind))throw new TypeError('Unknown meaningful kind: '+e.kind);
    const evidence=e.evidence,qualified=e.description?.trim()&&e.world_id&&Array.isArray(e.object_ids)&&e.object_ids.length&&e.object_ids.every(x=>typeof x==='string'&&x.trim())&&evidence?.basis&&['observed','authored'].includes(evidence.basis)&&evidence.note?.trim();
    // Small transform/opacity drift remains decoration even if mislabeled.
    const onlyTrivial=Array.isArray(e.changed_properties)&&e.changed_properties.length>0&&e.changed_properties.every(p=>['opacity_drift','ambient_phase','particle_seed','subpixel_offset'].includes(p));
    if(!qualified||onlyTrivial){unverified.push({...e,reason:onlyTrivial?'Declared properties are decorative':'Missing narrative/object/evidence context'});continue;}
    if(e.end>e.start&&e.continuous!==true){unverified.push({...e,reason:'A sustained meaningful interval needs continuous:true; a long label duration alone cannot suppress hold review'});continue;}
    accepted.push({...e});
  }
  accepted.sort((a,b)=>a.start-b.start||a.end-b.end||a.id.localeCompare(b.id));
  const narration=plan.narration_windows;
  if(narration!==undefined&&!Array.isArray(narration))throw new TypeError('Narration windows must be an array; omit for unknown');
  for(const x of narration||[])validateSpan(x,duration,'narration');
  const holds=plan.hold_annotations||[];for(const x of holds){validateSpan(x,duration,'hold annotation');if(!['readable','not_readable','unknown'].includes(x.readability))throw new TypeError('Hold readability must be readable/not_readable/unknown');}
  const merged=[];
  for(const e of accepted){const prev=merged.at(-1);if(prev&&e.start<=prev.end){prev.end=Math.max(prev.end,e.end);prev.ids.push(e.id);}else merged.push({start:e.start,end:e.end,ids:[e.id]});}
  const gaps=[];let cursor=0,last=null;
  for(const motion of merged){if(motion.start>cursor)gaps.push({start:cursor,end:motion.start,last,next:motion});cursor=Math.max(cursor,motion.end);last=motion;}
  if(cursor<duration)gaps.push({start:cursor,end:duration,last,next:null});
  const describe=(start,end,last,next)=>{
    const span={start,end},annotations=holds.filter(h=>h.start<=start+1e-7&&h.end>=end-1e-7);
    const overlapNarration=narration===undefined?null:narration.some(n=>intersects(n,span));
    const rationale=annotations.map(h=>h.rationale?.trim()).filter(Boolean).join(' | ')||null;
    const readability=annotations.length?(annotations.some(h=>h.readability==='not_readable')?'not_readable':annotations.every(h=>h.readability==='readable')?'readable':'unknown'):'unknown';
    return {start,end,hold_duration:end-start,last_meaningful_state_change:last?{time:last.end,event_ids:last.ids}:null,next_meaningful_state_change:next?{time:next.start,event_ids:next.ids}:null,narration_active:overlapNarration,visual_information_still_readable:readability,deliberate_hold_rationale:rationale,needs_author_response:!rationale||readability==='unknown'};
  };
  const intervals=gaps.map(g=>describe(g.start,g.end,g.last,g.next));
  const warnings=intervals.filter(g=>g.hold_duration>=holdThreshold-1e-8).map(g=>({code:'LONG_VISUAL_HOLD_REVIEW',severity:'review',...g}));
  const boundaries=accepted.flatMap(e=>e.end>e.start?[{id:e.id,time:e.start,boundary:'start'},{id:e.id,time:e.end,boundary:'end'}]:[{id:e.id,time:e.start,boundary:'point'}]).sort((a,b)=>a.time-b.time||a.id.localeCompare(b.id));
  const windows=[];
  for(let n=0;n*windowSeconds<duration;n++){
    const start=n*windowSeconds,end=Math.min(duration,start+windowSeconds),t=(start+end)/2;
    const active=accepted.filter(e=>e.end>e.start&&e.start<=t&&e.end>t),gap=intervals.find(g=>g.start<=t&&g.end>=t);
    const lastBoundary=boundaries.filter(e=>e.time<=t).at(-1),nextBoundary=boundaries.find(e=>e.time>t);
    windows.push({start,end,last_meaningful_state_change:lastBoundary??null,next_meaningful_state_change:nextBoundary??null,ongoing_meaningful_motion:active.map(e=>e.id),hold_duration:active.length?0:gap?.hold_duration??0,elapsed_hold:active.length?0:gap?t-gap.start:0,narration_active:narration===undefined?null:narration.some(n=>intersects(n,{start,end})),visual_information_still_readable:gap?.visual_information_still_readable??'unknown',deliberate_hold_rationale:gap?.deliberate_hold_rationale??null});
  }
  return {diagnostic:'VISUAL_STATE_DENSITY',schema_version:'1.0',status:warnings.length||unverified.length?'REVIEW':'CLEAR',hard_failure:false,technical_input_status:'VALID',duration,settings:{hold_threshold:holdThreshold,window_seconds:windowSeconds},accepted_events:accepted,ignored_decorative_events:ignored,unverified_events:unverified,meaningful_event_count:accepted.length,intervals,windows,warnings,author_responses_required:warnings.filter(w=>w.needs_author_response).length,limitations:['Semantic events are explicit analyst/author annotations; this does not infer facts from arbitrary pixels.','Continuous route/diagram actions count as ongoing meaningful motion only over their documented active interval.','An explained long hold still appears for review; neither duration nor a rationale determines aesthetic quality.','Missing narration/readability evidence remains unknown. No camera/SFX/motion minimum or maximum is imposed.']};
}
