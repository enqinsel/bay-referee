import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {assetManifest,assetRefs,poseCatalog,captionStyle,signoffState,signoffTiming,signoffTokens,repositoryRoot,resolveRepositoryPath,inspectAsset,renderSignoffPNG,buildSignoffCueSamples,ballAsset} from '../engine/bay-referee/production.mjs';
import {fontStyles,type,captionLine,measureText} from '../engine/bay-referee/typography.mjs';
import {createTypography,isHeadline,semanticColor} from '../engine/bay-referee/highlight-system.mjs';
import {parseArguments,validatePublicDownload,cacheFile,inspectCachedSound,checkPortableAssets,downloadSound,importSound} from '../scripts/bay-referee-assets.mjs';
import {createHash} from 'node:crypto';

test('portable modules import without historical media dependencies',()=>{
 assert.equal(typeof renderSignoffPNG,'function');assert.equal(typeof type,'function');assert.equal(typeof captionLine,'function');assert.equal(typeof measureText,'function');assert.equal(typeof buildSignoffCueSamples,'function');assert.equal(typeof ballAsset,'function');
 assert.equal(typeof createTypography({plan:{events:[]},time:()=>0,observations:()=>[]}), 'function');
 for(const name of ['production.mjs','typography.mjs','highlight-system.mjs']){const source=fs.readFileSync(path.join(repositoryRoot,'engine/bay-referee',name),'utf8');assert.doesNotMatch(source,/voice\/|var-saot|motion-lab|44\.2|1326|1353|\/Users\//);}
});
test('all approved visual assets have complete portable metadata and exact bytes',()=>{
 assert.equal(poseCatalog.length,24);assert.equal(assetRefs.head,'brand-head');assert.equal(new Set(assetManifest.assets.map(a=>a.id)).size,assetManifest.assets.length);
 for(const asset of assetManifest.assets){assert.equal(path.isAbsolute(asset.path),false);assert.equal(inspectAsset(asset.id).status,'VERIFIED',asset.id);}
 assert.equal(captionStyle.font.size_px,48);assert.deepEqual(captionStyle.chunking.typical_words,[2,5]);assert.equal(captionStyle.font.auto_shrink,false);assert.equal(fontStyles.Caption.axes.wdth,65);assert.equal(fontStyles.Archivo.axes.wght,860);
});
test('signoff state has only a local27-frame clock and stable endpoints',()=>{
 assert.deepEqual(signoffTiming,{fps:30,frames:27,duration:.9,sampleRate:48000});assert.equal('coreFrames' in signoffTiming,false);
 assert.deepEqual(signoffState(0),{local_time:0,head_scale:.98,head_dy:8,wordmark_dy:10,head_opacity:.8,wordmark_opacity:.72});
 assert.equal(signoffState(.2).head_scale,1);assert.equal(signoffState(.2).head_dy,0);assert.equal(signoffState(.67).head_dy,2);
 for(let frame=0;frame<27;frame++){const s=signoffState(frame/30);assert.ok(s.head_scale>=.98&&s.head_scale<=1);assert.ok(s.head_dy>=0&&s.head_dy<=8);}
 assert.throws(()=>signoffState(-.1));assert.throws(()=>signoffState(1));assert.throws(()=>signoffState(NaN));assert.deepEqual(signoffTokens.sound.blow_onsets_local_seconds,[.1,.34,.58]);
});
test('repository and local-cache paths reject traversal and absolute asset records',()=>{
 for(const p of ['../outside','/absolute','C:\\absolute','safe/../../outside'])assert.throws(()=>resolveRepositoryPath(p));
 assert.equal(resolveRepositoryPath('config/bay-referee-portable-assets.json'),path.join(repositoryRoot,'config/bay-referee-portable-assets.json'));
 assert.throws(()=>cacheFile({cache_relative_path:'../../outside'},'/tmp/test-cache'));
});
test('bootstrap defaults to read-only checks and explicit public hash-bound downloads',()=>{
 const a=parseArguments([]);assert.equal(a.check,true);assert.equal(a.download,false);assert.equal(parseArguments(['--check']).download,false);
 assert.throws(()=>parseArguments(['--download','--import-dir','somewhere']));assert.throws(()=>parseArguments(['--cache-dir']));
 assert.throws(()=>parseArguments(['--check','--download']),/cannot be combined/);assert.throws(()=>parseArguments(['--download','--check']),/cannot be combined/);assert.throws(()=>parseArguments(['--check','--import-dir','somewhere']),/cannot be combined/);
 for(const s of assetManifest.sfx){assert.match(validatePublicDownload(s),/^https:\/\/assets\.mixkit\.co\/active_storage\/sfx\/\d+\/\d+\.wav$/);assert.equal(s.storage,'local_cache_only');assert.equal(s.repository_distribution,'prohibited_raw_or_standalone_derived_cue');assert.doesNotMatch(JSON.stringify(s),/\/Users\/|Authorization|api[_-]?key|Bearer/);}
 assert.throws(()=>validatePublicDownload({...assetManifest.sfx[0],download:{...assetManifest.sfx[0].download,url:'https://example.com/source.wav'}}));
 const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'bay-asset-check-'));
 try{const result=checkPortableAssets({cacheDir:fixture});assert.equal(result.repository_ready,true);assert.equal(result.audio_ready,false);assert.equal(result.network_used,false);assert.equal(fs.readdirSync(fixture).length,0);assert.equal(inspectCachedSound(assetManifest.sfx[0],{cacheDir:fixture}).status,'MISSING');assert.equal(checkPortableAssets({cacheDir:fixture,requireSfx:true}).status,'FAIL');}finally{fs.rmSync(fixture,{recursive:true});}
});
test('mismatched files are observed without replacement',()=>{
 const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'bay-asset-mismatch-')),file=path.join(fixture,'example.txt'),before=Buffer.from('original text');
 fs.writeFileSync(file,before);
 try{const fake={assets:[{id:'fixture',path:'example.txt',bytes:3,sha256:'0'.repeat(64)}]};assert.equal(inspectAsset('fixture',{root:fixture,manifest:fake}).status,'MISMATCH');assert.deepEqual(fs.readFileSync(file),before);}finally{fs.rmSync(fixture,{recursive:true});}
});
test('cache ancestor symlinks block checks and acquisition before writes or network',async()=>{
 const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'bay-asset-symlink-')),cacheDir=path.join(fixture,'cache'),outside=path.join(fixture,'outside'),sourceDir=path.join(fixture,'source');
 for(const p of [cacheDir,outside,sourceDir])fs.mkdirSync(p);
 fs.symlinkSync(outside,path.join(cacheDir,'redirect'),'dir');
 const bytes=Buffer.from('plain text fixture'),record={...assetManifest.sfx[0],filename:'fixture.txt',cache_relative_path:'redirect/deep/fixture.txt',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
 fs.writeFileSync(path.join(sourceDir,record.filename),bytes);let fetches=0;
 try{
  assert.equal(inspectCachedSound(record,{cacheDir}).status,'SYMLINK_PATH');
  assert.throws(()=>importSound(record,{sourceDir,cacheDir}),/Refusing to overwrite/);
  await assert.rejects(downloadSound(record,{cacheDir,fetchImpl:async()=>{fetches++;throw Error('Unexpected network');}}),/Refusing to overwrite/);
  assert.equal(fetches,0);assert.deepEqual(fs.readdirSync(outside),[]);assert.equal(fs.readFileSync(path.join(sourceDir,record.filename),'utf8'),bytes.toString());
 }finally{fs.rmSync(fixture,{recursive:true});}
});
test('symlink above a missing cache base is rejected before source reads or network',async()=>{
 const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'bay-asset-parent-symlink-')),outside=path.join(fixture,'outside'),alias=path.join(fixture,'alias');
 fs.mkdirSync(outside);fs.symlinkSync(outside,alias,'dir');
 const cacheDir=path.join(alias,'new-cache'),record={...assetManifest.sfx[0],cache_relative_path:'items/test.txt'};let fetches=0;
 try{
  assert.equal(inspectCachedSound(record,{cacheDir}).status,'SYMLINK_PATH');
  // Missing import source proves the cache check runs before reading it.
  assert.throws(()=>importSound(record,{sourceDir:path.join(fixture,'missing-source'),cacheDir}),/SYMLINK_PATH/);
  await assert.rejects(downloadSound(record,{cacheDir,fetchImpl:async()=>{fetches++;throw Error('Unexpected network');}}),/SYMLINK_PATH/);
  assert.equal(fetches,0);assert.deepEqual(fs.readdirSync(outside),[]);assert.equal(fs.existsSync(path.join(outside,'new-cache')),false);
 }finally{fs.rmSync(fixture,{recursive:true});}
});
test('highlight treatments retain approved semantics without constructing media',()=>{
 assert.equal(semanticColor,'#E6FF75');assert.equal(isHeadline({x:540,y:285,maxWidth:936,anchor:'middle',size:82}),true);assert.equal(isHeadline({x:72,y:1404,maxWidth:336,anchor:'start',size:48}),false);
 assert.equal(typeof createTypography({plan:{events:[]},time:()=>0,observations:()=>[],isEditorial:o=>o.role==='EDITORIAL TEXT'}),'function');
});
