// Renderer-independent absolute-time helpers. No layout, palette, asset or clock.
const finite=(v,k)=>{if(!Number.isFinite(v))throw new TypeError(k+' must be finite');return v;};
export const easings=Object.freeze({linear:t=>t,smoothstep:t=>t*t*(3-2*t),easeOutCubic:t=>1-(1-t)**3,easeInOutSine:t=>(1-Math.cos(Math.PI*t))/2});
export function progressAt(time,{start,end,easing='smoothstep'}){
  for(const [k,v]of Object.entries({time,start,end}))finite(v,k);
  if(end<=start||!Object.hasOwn(easings,easing))throw new RangeError('Positive interval and known easing required');
  return easings[easing](Math.max(0,Math.min(1,(time-start)/(end-start))));
}
export function sampleObjectTrack(track,time){
  if(!track?.object_id||!track.owner||!track.purpose?.trim())throw new TypeError('Object, motion owner and narrative purpose required');
  const p=progressAt(time,track),keys=Object.keys(track.from||{});
  if(!keys.length||keys.length!==Object.keys(track.to||{}).length||keys.some(k=>!Object.hasOwn(track.to,k)))throw new TypeError('Matched numeric from/to properties required');
  return {object_id:track.object_id,owner:track.owner,progress:p,values:Object.fromEntries(keys.map(k=>[k,finite(track.from[k],k)+(finite(track.to[k],k)-track.from[k])*p]))};
}
export function validateMotionOwners(tracks){
  const errors=[];
  tracks.forEach(t=>sampleObjectTrack(t,t.start));
  for(let i=0;i<tracks.length;i++)for(let j=i+1;j<tracks.length;j++){
    const a=tracks[i],b=tracks[j];if(a.object_id!==b.object_id||Math.max(a.start,b.start)>=Math.min(a.end,b.end))continue;
    const conflicts=Object.keys(a.from).filter(k=>Object.hasOwn(b.from,k));
    if(a.owner!==b.owner||conflicts.length)errors.push({code:'COMPETING_MOTION_OWNER',object_id:a.object_id,tracks:[i,j],properties:conflicts});
  }return errors;
}
export function stateAt(plan,time){
  finite(time,'time');if(!Array.isArray(plan?.states))throw new TypeError('states array required');
  return plan.states.find(s=>time>=s.start&&time<s.end)??null;
}
export function diffObjects(previous=[],next=[]){
  const canonical=value=>{
    if(value===null||typeof value==='string'||typeof value==='boolean')return value;
    if(typeof value==='number')return finite(value,'Object property');
    if(Array.isArray(value))return value.map(canonical);
    if(value&&Object.getPrototypeOf(value)===Object.prototype)return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
    throw new TypeError('Object descriptions must be JSON values');
  };
  const map=items=>{const m=new Map();for(const o of items){if(!o.id||m.has(o.id))throw new TypeError('Unique persistent object IDs required');m.set(o.id,o);}return m;};
  const a=map(previous),b=map(next),persistent=[...b.keys()].filter(id=>a.has(id));
  return {enter:[...b.keys()].filter(id=>!a.has(id)),exit:[...a.keys()].filter(id=>!b.has(id)),persistent,updated:persistent.filter(id=>JSON.stringify(canonical(a.get(id)))!==JSON.stringify(canonical(b.get(id))))};
}
