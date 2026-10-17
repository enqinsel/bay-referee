import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assetManifest,repositoryRoot,inspectAsset,defaultCacheDirectory,sha256} from '../engine/bay-referee/production.mjs';

// Default operation is read-only. Licensed source audio stays in a local cache,
// never inside a source/LFS package. Network is possible only with --download.
export function cacheFile(record,cacheDir){
 const relative=record.cache_relative_path;
 if(typeof relative!=='string'||!relative||path.isAbsolute(relative)||path.win32.isAbsolute(relative)||relative.includes('\0'))throw Error('Invalid local-cache asset path');
 const base=path.resolve(cacheDir),file=path.resolve(base,relative),inside=path.relative(base,file);
 if(!inside||inside==='..'||inside.startsWith('..'+path.sep)||path.isAbsolute(inside))throw Error('Asset escapes local cache');
 return file;
}
function isCanonicalSystemAlias(file){
 // macOS exposes these system directories through fixed root aliases. Permit
 // only their exact canonical targets, never arbitrary project/user symlinks.
 const expected=process.platform==='darwin'?({'/var':'/private/var','/tmp':'/private/tmp','/etc':'/private/etc'})[file]:null;
 return !!expected&&path.resolve(path.dirname(file),fs.readlinkSync(file))===expected&&fs.realpathSync(file)===expected;
}
function cachePathIssue(record,cacheDir){
 const base=path.resolve(cacheDir),file=cacheFile(record,base),anchor=path.parse(file).root,parts=path.relative(anchor,file).split(path.sep);
 // Walk from the filesystem root, not just cacheDir: an ancestor symlink
 // before a missing cache base must be rejected before mkdir/read/network.
 const paths=[anchor];for(const part of parts)paths.push(path.join(paths.at(-1),part));
 for(let i=0;i<paths.length;i++){
  let stat;try{stat=fs.lstatSync(paths[i]);}catch(error){if(error.code==='ENOENT')return null;throw error;}
  if(stat.isSymbolicLink()){if(i<paths.length-1&&isCanonicalSystemAlias(paths[i]))continue;return 'SYMLINK_PATH';}
  if(i<paths.length-1&&!stat.isDirectory())return 'UNEXPECTED_FILE_TYPE';
  if(i===paths.length-1&&!stat.isFile())return 'UNEXPECTED_FILE_TYPE';
 }
 return null;
}
export function inspectCachedSound(record,{cacheDir=defaultCacheDirectory()}={}){
 const file=cacheFile(record,cacheDir);
 const issue=cachePathIssue(record,cacheDir);if(issue)return {id:record.id,status:issue,cache_relative_path:record.cache_relative_path};
 if(!fs.existsSync(file))return {id:record.id,status:'MISSING',cache_relative_path:record.cache_relative_path};
 const stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink())return {id:record.id,status:'UNEXPECTED_FILE_TYPE',cache_relative_path:record.cache_relative_path};
 const realBase=fs.realpathSync(cacheDir),realFile=fs.realpathSync(file),within=path.relative(realBase,realFile);
 if(within==='..'||within.startsWith('..'+path.sep)||path.isAbsolute(within))return {id:record.id,status:'EXTERNAL_SYMLINK',cache_relative_path:record.cache_relative_path};
 if(stat.size!==record.bytes)return {id:record.id,status:'MISMATCH',bytes:stat.size,expected_bytes:record.bytes,cache_relative_path:record.cache_relative_path};
 const hash=sha256(fs.readFileSync(file));
 return {id:record.id,status:hash===record.sha256?'VERIFIED':'MISMATCH',bytes:stat.size,sha256:hash,expected_sha256:record.sha256,cache_relative_path:record.cache_relative_path};
}
export function checkPortableAssets({root=repositoryRoot,manifest=assetManifest,cacheDir=defaultCacheDirectory({root}),requireSfx=false}={}){
 const repository=manifest.assets.map(a=>inspectAsset(a.id,{root,manifest})),sounds=manifest.sfx.map(a=>inspectCachedSound(a,{cacheDir}));
 const repositoryReady=repository.every(a=>a.status==='VERIFIED'),audioReady=sounds.every(a=>a.status==='VERIFIED');
 const mismatched=sounds.some(a=>!['VERIFIED','MISSING'].includes(a.status));
 const closureReady=manifest.sfx.filter(a=>a.required_for_brand_closure).every(a=>sounds.find(s=>s.id===a.id)?.status==='VERIFIED');
 const failed=!repositoryReady||mismatched||(requireSfx&&!audioReady);
 return {status:failed?'FAIL':audioReady?'VERIFIED':'VISUAL_ASSETS_READY_AUDIO_NOT_CACHED',repository_ready:repositoryReady,audio_ready:audioReady,full_brand_closure_ready:closureReady,cache_directory:path.resolve(cacheDir),network_used:false,require_sfx:requireSfx,repository,sounds,next_action:audioReady?null:'Use --download or --import-dir PATH to acquire hash-matching source audio into the private cache. --require-sfx makes missing audio a failing check.'};
}
export function validatePublicDownload(record){
 if(!record.eligible||record.provider!=='Mixkit'||record.storage!=='local_cache_only'||record.download?.mode!=='public-direct'||record.download.credentials!==false)throw Error('Asset metadata does not authorize a public Mixkit download');
 const u=new URL(record.download.url);
 if(u.protocol!=='https:'||u.hostname!=='assets.mixkit.co'||u.username||u.password||u.search||u.hash||u.pathname!==`/active_storage/sfx/${record.source_item_id}/${record.source_item_id}.wav`)throw Error('Only the manifest-listed public Mixkit WAV endpoint is allowed');
 return u.href;
}
function writeVerifiedCache(record,bytes,cacheDir){
 if(bytes.length!==record.bytes||sha256(bytes)!==record.sha256)throw Error(`Source ${record.id} differs from its recorded bytes/SHA-256; nothing was written.`);
 const file=cacheFile(record,cacheDir),existing=inspectCachedSound(record,{cacheDir});
 if(existing.status==='VERIFIED')return {...existing,action:'ALREADY_PRESENT'};
 if(existing.status!=='MISSING')throw Error(`Refusing to overwrite existing ${record.id}: ${existing.status}`);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 const issue=cachePathIssue(record,cacheDir);if(issue)throw Error('Unsafe cache path: '+issue);
 const realBase=fs.realpathSync(cacheDir),realParent=fs.realpathSync(path.dirname(file)),within=path.relative(realBase,realParent);
 if(within==='..'||within.startsWith('..'+path.sep)||path.isAbsolute(within))throw Error('Cache parent escapes cache directory');
 // wx prevents a concurrently created or mismatched file from being replaced.
 fs.writeFileSync(file,bytes,{flag:'wx',mode:0o600});
 return {...inspectCachedSound(record,{cacheDir}),action:'ACQUIRED'};
}
export async function downloadSound(record,{cacheDir=defaultCacheDirectory(),fetchImpl=globalThis.fetch}={}){
 const url=validatePublicDownload(record),existing=inspectCachedSound(record,{cacheDir});
 if(existing.status==='VERIFIED')return {...existing,action:'ALREADY_PRESENT'};
 if(existing.status!=='MISSING')throw Error(`Refusing to overwrite existing ${record.id}: ${existing.status}`);
 const response=await fetchImpl(url,{redirect:'error',credentials:'omit',signal:AbortSignal.timeout(30000),headers:{Accept:'audio/wav, audio/x-wav, application/octet-stream'}});
 if(!response.ok||!response.body)throw Error(`Public source fetch failed for ${record.id}: HTTP ${response.status}`);
 const parts=[];let bytes=0;
 for await(const chunk of response.body){bytes+=chunk.length;if(bytes>record.bytes){await response.body.cancel?.().catch(()=>{});throw Error(`Source ${record.id} exceeds recorded byte count; nothing was written.`);}parts.push(Buffer.from(chunk));}
 return writeVerifiedCache(record,Buffer.concat(parts),cacheDir);
}
export function importSound(record,{sourceDir,cacheDir=defaultCacheDirectory()}={}){
 if(!sourceDir)throw Error('--import-dir needs the local directory containing original provider filenames');
 const existing=inspectCachedSound(record,{cacheDir});
 if(existing.status==='VERIFIED')return {...existing,action:'ALREADY_PRESENT'};
 if(existing.status!=='MISSING')throw Error(`Refusing to overwrite existing ${record.id}: ${existing.status}`);
 if(path.basename(record.filename)!==record.filename)throw Error('Unsafe original filename');
 const file=path.join(path.resolve(sourceDir),record.filename),stat=fs.lstatSync(file);
 if(!stat.isFile()||stat.isSymbolicLink())throw Error('Import source must be a regular original file');
 return writeVerifiedCache(record,fs.readFileSync(file),cacheDir);
}
export function parseArguments(args){
 const result={check:false,download:false,requireSfx:false,cacheDir:defaultCacheDirectory(),sourceDir:null,assetIds:[],help:false};
 for(let i=0;i<args.length;i++){
  const a=args[i];if(a==='--check')result.check=true;else if(a==='--download')result.download=true;else if(a==='--require-sfx')result.requireSfx=true;else if(a==='--help')result.help=true;
  else if(['--cache-dir','--import-dir','--asset'].includes(a)){const value=args[++i];if(!value||value.startsWith('--'))throw Error(a+' needs a value');if(a==='--cache-dir')result.cacheDir=path.resolve(value);else if(a==='--import-dir')result.sourceDir=value;else result.assetIds.push(value);}
  else throw Error('Unknown argument: '+a);
 }
 if(result.download&&result.sourceDir)throw Error('Choose --download or --import-dir, not both');
 if(result.check&&(result.download||result.sourceDir))throw Error('--check cannot be combined with --download or --import-dir');
 if(!result.download&&!result.sourceDir)result.check=true;
 return result;
}
export async function main(args=process.argv.slice(2)){
 const options=parseArguments(args);
 if(options.help){console.log('BAY REFEREE asset bootstrap\n  node scripts/bay-referee-assets.mjs --check [--cache-dir PATH] [--require-sfx]\n  node scripts/bay-referee-assets.mjs --download [--asset ID] [--cache-dir PATH]\n  node scripts/bay-referee-assets.mjs --import-dir PATH [--asset ID] [--cache-dir PATH]\nChecks never write or access the network. Download requires the explicit flag, public allowlisted Mixkit URLs and matching bytes/SHA-256. Existing mismatches are preserved. Licensed raw audio and standalone cues stay outside Git/LFS.');return 0;}
 const selected=options.assetIds.length?options.assetIds.map(id=>{const a=assetManifest.sfx.find(s=>s.id===id);if(!a)throw Error('Unknown cached sound: '+id);return a;}):assetManifest.sfx;
 const acquisitions=[];
 if(options.download||options.sourceDir)for(const a of selected)acquisitions.push(options.download?await downloadSound(a,options):importSound(a,options));
 const report=checkPortableAssets({cacheDir:options.cacheDir,requireSfx:options.requireSfx});report.network_used=options.download&&acquisitions.some(a=>a.action==='ACQUIRED');report.acquisitions=acquisitions;
 console.log(JSON.stringify(report,null,2));return report.status==='FAIL'?1:0;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().then(code=>{process.exitCode=code;}).catch(error=>{console.error(error.message);process.exitCode=1;});
