import definitions from './v1.json' with {type:'json'};
const finite=(v,k)=>{if(!Number.isFinite(v))throw new TypeError(k+' must be finite');return v;};
const deepFreeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(deepFreeze);Object.freeze(value);}return value;};
export const tokenDefinitions=deepFreeze(definitions);
export function resolveTokens({width=1080,fontFamily='system-ui',episodeAccent,colors={}}={}) {
  finite(width,'width');if(width<=0)throw new RangeError('width must be positive');
  if(typeof episodeAccent!=='string'||!episodeAccent.trim())throw new TypeError('An episodeAccent is required; no channel palette is implicit');
  if(typeof fontFamily!=='string'||/[;{}<>]/.test(fontFamily))throw new TypeError('Invalid font family');
  const scale=width/definitions.reference_width,numberMap=map=>Object.fromEntries(Object.entries(map).map(([k,v])=>[k,v*scale]));
  const palette={paper:'#f5f4f0',ink:'#222723',muted:'#656b67',outline:'#ffffff',shadow:'#000000',contrast_on_accent:'#ffffff',...colors,episode_accent:episodeAccent};
  for(const v of Object.values(palette))if(typeof v!=='string'||!/^#[0-9a-f]{3,8}$/i.test(v)||![4,5,7,9].includes(v.length))throw new TypeError('Colors must be hex values');
  return {version:definitions.version,width,fontFamily,spacing:numberMap(definitions.spacing),stroke:numberMap(definitions.stroke),radius:numberMap(definitions.radius),type:Object.fromEntries(Object.entries(definitions.type).map(([k,v])=>[k,{...v,size:v.size*scale}])),shadow:Object.fromEntries(Object.entries(definitions.shadow).map(([k,v])=>[k,{...v,x:v.x*scale,y:v.y*scale,blur:v.blur*scale}])),outline:Object.fromEntries(Object.entries(definitions.outline).map(([k,v])=>[k,{width:v.width*scale}])),depth:{...definitions.depth},motion_seconds:structuredClone(definitions.motion_seconds),easing:{...definitions.easing},safe_roles:{...definitions.safe_roles},colors:palette};
}
export function tokensToCSS(tokens,{selector=':root'}={}){
  if(!/^:root$|^\.[a-z][a-z0-9_-]*$/i.test(selector))throw new TypeError('Use :root or a simple class selector');
  const lines=[`--em-font:${tokens.fontFamily}`];
  for(const group of ['spacing','stroke','radius'])for(const[k,v]of Object.entries(tokens[group]))lines.push(`--em-${group}-${k}:${v}px`);
  for(const[k,v]of Object.entries(tokens.type))lines.push(`--em-type-${k.replaceAll('_','-')}:${v.size}px`,`--em-weight-${k.replaceAll('_','-')}:${v.weight}`);
  for(const[k,v]of Object.entries(tokens.colors))lines.push(`--em-${k.replaceAll('_','-')}:${v}`);
  for(const[k,v]of Object.entries(tokens.depth))lines.push(`--em-depth-${k.replaceAll('_','-')}:${v}`);
  return `${selector}{\n  ${lines.join(';\n  ')};\n}\n`;
}
