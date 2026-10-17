/* Original time-pure building blocks. Reference concepts are documented per scene;
 * no framework or third-party source is copied. Camera lives in camera.js. */
(function(root){'use strict';
 const clamp=v=>Math.max(0,Math.min(1,v));
 const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
 const phase=(t,o)=>{if(!Number.isFinite(t)||!Number.isFinite(o.start)||!(o.duration>0))throw Error('Finite time/start and positive duration required');return smooth((t-o.start)/o.duration);};
 function maskedReveal(el,t,o){const p=phase(t,o),edge=((1-p)*100).toFixed(5);el.style.clipPath=o.direction==='left'?`inset(0 ${edge}% 0 0)`:`inset(${edge}% 0 0 0)`;el.dataset.motionReveal=String(p);return p;}
 function objectPush(el,t,o){const p=phase(t,o),a=o.from||{x:0,y:0},b=o.to||{x:0,y:0};el.style.transform=`translate3d(${((a.x||0)+((b.x||0)-(a.x||0))*p).toFixed(4)}px,${((a.y||0)+((b.y||0)-(a.y||0))*p).toFixed(4)}px,0)`;if(o.fade)el.style.opacity=String(p);return p;}
 function numberReveal(el,t,o){return objectPush(el,t,{...o,from:{x:0,y:o.offsetY??24},to:{x:0,y:0},fade:true});}
 function focusHold(el,t,o){const active=t>=o.start&&t<o.end;el.style.opacity=active?'1':'0';return active;}
 const lengths=new WeakMap();
 function routeDraw(el,t,o){if(!lengths.has(el))lengths.set(el,el.getTotalLength());const l=lengths.get(el),p=(o.from??0)+((o.to??1)-(o.from??0))*phase(t,o);el.style.strokeDasharray=`${l} ${l}`;el.style.strokeDashoffset=String(l*(1-p));return p;}
 function editorialCrop(el,o){for(const k of ['x','y','width','height'])if(!Number.isFinite(o[k]))throw Error('Fixed crop geometry required');Object.assign(el.style,{left:o.x+'px',top:o.y+'px',width:o.width+'px',height:o.height+'px',position:'absolute'});return Object.freeze({...o});}
 root.EngineMotion=Object.freeze({...root.EngineMotion,maskedReveal,objectPush,numberReveal,focusHold,routeDraw,editorialCrop});
})(typeof window==='undefined'?globalThis:window);
