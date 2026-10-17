/* One on-screen primary text task, with a complete independent accessibility track. */
(function(global){
 'use strict';
 const kinds=new Set(['caption','hero','graphic','document']);
 function validateWindows(windows){
  const sorted=[...windows].sort((a,b)=>a.start-b.start);
  for(let i=0;i<sorted.length;i++){const w=sorted[i];if(!Number.isFinite(w.start)||!Number.isFinite(w.end)||w.start<0||w.end<=w.start||!kinds.has(w.kind))throw Error('Invalid text responsibility window');if(i&&w.start<sorted[i-1].end)throw Error('Overlapping text responsibility windows');}
  return true;
 }
 function at(time,windows){validateWindows(windows);return windows.find(w=>time>=w.start&&time<w.end)||{kind:'caption',id:'caption-default'};}
 function apply(caption,phrase,time,windows){const task=at(time,windows);caption.textContent=phrase?.text||'';caption.style.visibility=phrase&&task.kind==='caption'?'visible':'hidden';caption.dataset.captionId=phrase?.id||'';caption.dataset.responsibility=task.kind;return task;}
 global.EngineTextResponsibility={validateWindows,at,apply};
})(typeof window==='undefined'?globalThis:window);
