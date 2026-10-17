// Semantic, finite motion. No ambient oscillation and no camera transform.
export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const ease=n=>{const p=clamp(n);return p*p*(3-2*p)};
export const progress=(t,a,b)=>ease((t-a)/(b-a));
export const mix=(a,b,p)=>a+(b-a)*p;
export const point=(a,b,p)=>({x:mix(a.x,b.x,p),y:mix(a.y,b.y,p)});
export const dim=(active,other=.29)=>active?1:other;
export const motionPrimitives={
  mascotPoint:{kind:'pose-cut',leadSeconds:.17,purpose:'establish the side before its objects activate'},
  objectEmphasis:{kind:'focus-brighten',duration:.20,purpose:'identify the currently explained role'},
  objectSwap:{kind:'cut',purpose:'replace one subject asset with a narratively related subject'},
  panelReveal:{kind:'clip',duration:.30,purpose:'reveal an inset asset only when narration introduces it'},
  routeDraw:{kind:'stroke-progress',duration:.60,purpose:'show one pass or one run'},
  areaHighlight:{kind:'finite-fade',duration:.24,purpose:'locate the role or available passing pocket'},
  compareShift:{kind:'focus-switch',duration:.20,purpose:'compare successive priorities on one field'},
  connectorAttach:{kind:'path',duration:.20,purpose:'attach a gesture to its exact target'},
  labelPopIn:{kind:'opacity',duration:.12,purpose:'reinforce an already spoken short phrase'},
  simpleStepReveal:{kind:'discrete-state',purpose:'add the next participant only when needed'}
};
