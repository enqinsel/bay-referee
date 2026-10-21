#!/usr/bin/env node
/** Read-only source/bootstrap smoke. No frames, media, model inference or provider calls. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import * as fontkit from 'fontkit';
import {validateSkill} from './skill-bay-referee.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const checks=[];
async function check(name,fn){try{checks.push({name,status:'PASS',detail:await fn()});}catch(error){checks.push({name,status:'FAIL',detail:error.message});}}
await check('production_source_imports',async()=>{
  const modules=['engine/bay-referee/production.mjs','engine/bay-referee/delivery-qa.mjs','engine/bay-referee/highlight-system.mjs','engine/captions/phrases.mjs','engine/motion/editorial-state.mjs','engine/motion/editorial-primitives.mjs','engine/audio/mix-sfx.mjs','engine/audio/preflight-mix.mjs','engine/qa/platform-exclusions.mjs','engine/qa/platform-safety.mjs','engine/assets/publication-gate.mjs','formats/football-comparison-v1/system/grammar.mjs','formats/football-comparison-v2/system/football-world.mjs'];
  for(const module of modules)await import(new URL('../'+module,import.meta.url));
  return {modules,mediaCreated:false};
});
await check('brand_identity_and_source_assets',async()=>{
  const placement=JSON.parse(await fs.readFile(path.join(root,'brand/bay-referee/avatar/placement.json'),'utf8'));
  const poses=Object.values(placement.poses).map(p=>path.join(root,'brand/bay-referee/avatar',p.file));
  for(const file of [...poses,path.join(root,'brand/bay-referee/brand-bug/head.png'),path.join(root,'brand/bay-referee/watermark/lockup.png'),path.join(root,'brand/bay-referee/wordmark/wordmark.png')]){
    const meta=await sharp(file).metadata();if(!meta.width||!meta.height||!meta.hasAlpha)throw Error('Invalid approved alpha asset: '+path.relative(root,file));
  }
  const font=fontkit.openSync(path.join(root,'formats/football-comparison-v1/fonts/Archivo-variable.ttf'));if(!font.familyName.includes('Archivo'))throw Error('Approved caption font missing');
  return {poses:poses.length,font:font.familyName,readOnlyMetadata:true};
});
await check('voice_and_caption_authorities',async()=>{
  const voice=JSON.parse(await fs.readFile(path.join(root,'voice/decision.json'),'utf8'));
  if(voice.voice.name!=='Engin'||voice.model!=='elevenlabs_v4'||voice.settings.stability!==0.5||voice.settings.similarity_boost!==0.75)throw Error('Voice authority drift');
  const caption=JSON.parse(await fs.readFile(path.join(root,'formats/football-production-kit-v1/system/caption-style.json'),'utf8'));
  return {voice:'Engin / Higgsfield / ElevenLabs v4',captionAuthorityPresent:typeof caption==='object',remoteVoiceAccess:'MANUAL_CONNECTION_REQUIRED',oldNarrationLoaded:false};
});
await check('daily_package_template',async()=>{
  const base=path.join(root,'brand/bay-referee/production-template');
  const layout=JSON.parse(await fs.readFile(path.join(base,'layout.json'),'utf8'));
  for(const entry of layout.files)await fs.access(path.join(base,entry.template));
  return {directories:layout.directories.length,textTemplates:layout.files.length,mediaGenerated:false};
});
await check('maintained_skill',async()=>{const skill=await validateSkill();return {files:skill.files.length,localReferences:skill.localReferences,sha256:skill.sourceTreeSha256};});
await check('portable_asset_metadata',async()=>{
  const manifest=JSON.parse(await fs.readFile(path.join(root,'config/bay-referee-portable-assets.json'),'utf8'));
  return {present:true,schema:manifest.schema??manifest.schema_version??manifest.schemaVersion??null,licensedAudio:'Must be acquired and checked locally; no stock audio bundled or downloaded by smoke.'};
});
const report={status:checks.every(c=>c.status==='PASS')?'PASS':'FAIL',root,checks,mode:'NO_MEDIA_IMPORT_ONLY',mediaGenerated:false,providerJobs:0,remoteAccountVerified:false};
console.log(JSON.stringify(report,null,2));process.exitCode=report.status==='PASS'?0:1;
