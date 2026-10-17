import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

// Portable approved components. Imports read metadata only; no output, setup,
// network, episode clock, historical narration or render job runs on import.
export const repositoryRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const manifestRelativePath='config/bay-referee-portable-assets.json';
const deepFreeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};
export const sha256=data=>crypto.createHash('sha256').update(data).digest('hex');

export function resolveRepositoryPath(relative,{root=repositoryRoot}={}){
 if(typeof relative!=='string'||!relative||relative.includes('\0')||path.isAbsolute(relative)||path.win32.isAbsolute(relative))throw Error('Expected a repository-relative asset path');
 const base=path.resolve(root),resolved=path.resolve(base,relative),within=path.relative(base,resolved);
 if(within==='..'||within.startsWith('..'+path.sep)||path.isAbsolute(within))throw Error('Asset path escapes repository');
 return resolved;
}
export function readPortableManifest({root=repositoryRoot}={}){
 const file=resolveRepositoryPath(manifestRelativePath,{root}),value=JSON.parse(fs.readFileSync(file,'utf8'));
 if(value.schema!=='bay-referee-portable-assets-v1'||!Array.isArray(value.assets)||!Array.isArray(value.sfx)||!Array.isArray(value.poses))throw Error('Unsupported BAY REFEREE asset manifest');
 const ids=new Set();for(const a of [...value.assets,...value.sfx]){if(!a.id||ids.has(a.id)||!/^[a-f0-9]{64}$/.test(a.sha256)||!Number.isSafeInteger(a.bytes)||a.bytes<=0)throw Error('Invalid or duplicate asset record');ids.add(a.id);if(a.path)resolveRepositoryPath(a.path,{root});}
 return deepFreeze(value);
}
export const assetManifest=readPortableManifest();
export const assetRefs=assetManifest.asset_refs;
export const poseCatalog=assetManifest.poses;
export const captionStyle=assetManifest.tokens.caption;
export const watermarkTokens=assetManifest.tokens.watermark;
export const signoffTokens=assetManifest.tokens.signoff;
export const signoffTiming=signoffTokens.timing;
export const palette=deepFreeze({...assetManifest.tokens.brand.palette,left:'#FFC368',right:'#88DDD0',leftInk:'#FFC368',rightInk:'#88DDD0',muted:'#96B6A3'});
export function assetRecord(id,{manifest=assetManifest}={}){const record=manifest.assets.find(a=>a.id===id);if(!record)throw Error('Unknown repository asset: '+id);return record;}
export function poseRecord(id,{manifest=assetManifest}={}){const record=manifest.poses.find(a=>a.id===id);if(!record)throw Error('Unknown approved pose: '+id);return record;}
export function assetPath(id,{root=repositoryRoot,manifest=assetManifest}={}){return resolveRepositoryPath(assetRecord(id,{manifest}).path,{root});}

export function inspectAsset(id,{root=repositoryRoot,manifest=assetManifest}={}){
 const record=assetRecord(id,{manifest}),file=assetPath(id,{root,manifest});
 if(!fs.existsSync(file))return {id,path:record.path,status:'MISSING',expected_bytes:record.bytes,expected_sha256:record.sha256};
 const actualRoot=fs.realpathSync(root),actualPath=fs.realpathSync(file),relative=path.relative(actualRoot,actualPath);
 if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))return {id,path:record.path,status:'EXTERNAL_SYMLINK'};
 const data=fs.readFileSync(file),hash=sha256(data);
 if(data.subarray(0,128).toString().startsWith('version https://git-lfs.github.com/spec/v1'))return {id,path:record.path,status:'LFS_POINTER',action:'Retrieve the repository LFS assets before production.'};
 return {id,path:record.path,status:data.length===record.bytes&&hash===record.sha256?'VERIFIED':'MISMATCH',bytes:data.length,sha256:hash,expected_bytes:record.bytes,expected_sha256:record.sha256};
}
export function loadAssetBytes(id,options={}){
 const result=inspectAsset(id,options);if(result.status!=='VERIFIED')throw Error(`Asset ${id}: ${result.status}; preserve the existing file and restore the hash-matching approved asset.`);
 return fs.readFileSync(assetPath(id,options));
}
export function defaultCacheDirectory({root=repositoryRoot}={}){return resolveRepositoryPath(assetManifest.paths.default_cache,{root});}

const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function signoffState(localTime){
 if(!Number.isFinite(localTime)||localTime<0||localTime>=signoffTiming.duration+1e-8)throw Error('Sign-off localTime must be in [0, 0.9] seconds');
 const settle=smooth(localTime/.14),textSettle=smooth(localTime/.17);
 const nod=localTime>=.58&&localTime<.76?2*Math.sin((localTime-.58)/.18*Math.PI):0;
 return {local_time:localTime,head_scale:.98+.02*settle,head_dy:Math.round(8*(1-settle)+nod),wordmark_dy:Math.round(10*(1-textSettle)),head_opacity:.8+.2*settle,wordmark_opacity:.72+.28*textSettle};
}
const visualCache=new Map();
async function signoffAssets({root,manifest}){
 const key=path.resolve(root)+'|'+manifest.assets.find(a=>a.id===manifest.asset_refs.head).sha256+'|'+manifest.assets.find(a=>a.id===manifest.asset_refs.wordmark).sha256;
 if(!visualCache.has(key))visualCache.set(key,(async()=>{
  const head=await sharp(loadAssetBytes(manifest.asset_refs.head,{root,manifest})).trim().resize(414,450,{fit:'inside',withoutEnlargement:false}).ensureAlpha().png().toBuffer();
  const wordmark=await sharp(loadAssetBytes(manifest.asset_refs.wordmark,{root,manifest})).trim().resize(740,112,{fit:'inside',withoutEnlargement:false}).ensureAlpha().png().toBuffer();
  return {head,wordmark,headMeta:await sharp(head).metadata(),wordmarkMeta:await sharp(wordmark).metadata()};
 })());
 return visualCache.get(key);
}
export async function renderSignoffPNG(localTime,{root=repositoryRoot,manifest=assetManifest,width=1080,height=1920}={}){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)throw Error('Invalid output canvas');
 const s=signoffState(localTime),a=await signoffAssets({root,manifest});
 const hw=Math.round(a.headMeta.width*s.head_scale),hh=Math.round(a.headMeta.height*s.head_scale);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="field" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#092C22"/><stop offset=".52" stop-color="#1C5037"/><stop offset="1" stop-color="#0D382B"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#field)"/><g fill="none" stroke="#B5D3AE" stroke-width="3" opacity=".12"><path d="M90 1484H990M540 1484V1810"/><ellipse cx="540" cy="1484" rx="295" ry="113"/></g><image href="data:image/png;base64,${a.head.toString('base64')}" x="${Math.round((1080-hw)/2)}" y="${630+s.head_dy+Math.round((450-hh)/2)}" width="${hw}" height="${hh}" opacity="${s.head_opacity}"/><image href="data:image/png;base64,${a.wordmark.toString('base64')}" x="${Math.round((1080-a.wordmarkMeta.width)/2)}" y="${1140+s.wordmark_dy}" width="${a.wordmarkMeta.width}" height="${a.wordmarkMeta.height}" opacity="${s.wordmark_opacity}"/></svg>`;
 let image=sharp(Buffer.from(svg));if(width!==1080||height!==1920)image=image.resize(width,height,{fit:'fill'});
 return image.png().toBuffer();
}

// Pure sample-domain recipe. Caller supplies the verified source decoded to
// mono48kHz. The resulting cue stays local and is used only in an edited video.
// This function does not read/write audio, run FFmpeg or copy a past episode.
export function buildSignoffCueSamples(source,{sampleRate=signoffTiming.sampleRate}={}){
 if(!(source instanceof Float32Array)||sampleRate!==48000)throw Error('Verified mono48kHz Float32Array source required');
 const p=signoffTokens.sound,out=new Float32Array(Math.round(signoffTiming.duration*sampleRate));
 for(let b=0;b<3;b++){
  const sourceStart=Math.round(p.source_in_seconds*sampleRate),length=Math.round(p.blow_durations_seconds[b]*sampleRate);
  if(sourceStart+length>source.length)throw Error('Whistle source is shorter than the approved excerpt');
  const samples=source.slice(sourceStart,sourceStart+length),fadeIn=Math.round(p.fade_in_seconds*sampleRate),fadeOut=Math.round(p.fade_out_seconds[b]*sampleRate);
  let peak=0;for(let i=0;i<samples.length;i++){samples[i]*=Math.max(0,Math.min(1,i/(fadeIn-1),(samples.length-1-i)/(fadeOut-1)));peak=Math.max(peak,Math.abs(samples[i]));}
  if(!peak)throw Error('Silent whistle source');
  const gain=10**(p.peak_targets_dbfs[b]/20)/peak,start=Math.round(p.blow_onsets_local_seconds[b]*sampleRate);
  for(let i=0;i<samples.length;i++)out[start+i]+=samples[i]*gain;
 }
 return out;
}

export function ballAsset(p){return `<g transform="translate(${p.x} ${p.y})"><ellipse cy="12" rx="18" ry="9" fill="#09251C" opacity=".35"/><circle r="17" fill="#F7F3DF" stroke="#0B281F" stroke-width="2.5"/><path d="M0,-7L7,-2L4,6L-5,6L-7,-2Z M-15,-7L-11,-11L-7,-7L-9,-2Z M10,-10L15,-5L11,0L7,-3Z M-10,11L-5,7L0,11L-1,16Z M6,10L12,7L14,10L9,14Z" fill="#102820"/><path d="M0,-7L0,-15M7,-2L12,-4M4,6L8,11M-5,6L-8,10M-7,-2L-12,-5" fill="none" stroke="#102820" stroke-width="1"/></g>`;}
