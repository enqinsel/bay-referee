#!/usr/bin/env node
/** macOS-first portable bootstrap. No generation, rendering, publishing or media deletion. */
import fs from 'node:fs/promises';
import {constants as fsConstants} from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {projectRoot,defaultSkillDirectory,validateSkill,synchronizeSkill,assertDirectoryAncestry} from './skill-bay-referee.mjs';

const HERE=fileURLToPath(import.meta.url),require=createRequire(import.meta.url);
const exists=async p=>fs.lstat(p).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const LOCAL_DIRS=['videolar','.cache/whisper','.cache/bay-referee-assets','.cache/numba','.cache/matplotlib','.cache/setup','.cache/skill-backups','.tools/bin'];
const HELP=`BAY REFEREE portable setup (Node >=22, Python3.12, macOS Apple Silicon validated)
Usage: node scripts/setup-bay-referee.mjs [options]
  --check          Read-only readiness checks; never install/synchronize/write.
  --dry-run        Report planned actions; never install/synchronize/write.
  --skip-install   Require existing npm/Python packages; still prepare local dirs and skill.
  --skill-dir DIR  Exact destination skill folder (default Codex convention).
  --python PATH   Python3.12 interpreter for creating a missing project .venv.
  --restore-node  Explicitly permit npm ci when existing node_modules is inconsistent.
  --skip-smoke     Omit the import-only portable smoke check (reported, not a full PASS).
  --download-whisper-model  Fetch/load missing medium weights locally; no transcription.
No credentials are created. Higgsfield connection is manual in Codex. No paid job,
render, episode media generation, R&D removal, Git action or cloud upload occurs.
`;
export function parseOptions(args){
 const o={check:false,dryRun:false,skipInstall:false,skipSmoke:false,restoreNode:false,downloadModel:false,skillDir:defaultSkillDirectory()};
 for(let i=0;i<args.length;i++){
  const a=args[i];
  if(a==='--check')o.check=true;else if(a==='--dry-run')o.dryRun=true;else if(a==='--skip-install')o.skipInstall=true;
  else if(a==='--skip-smoke')o.skipSmoke=true;else if(a==='--restore-node')o.restoreNode=true;else if(a==='--download-whisper-model')o.downloadModel=true;
  else if(a==='--skill-dir'||a==='--python'){if(!args[++i]||args[i].startsWith('--'))throw Error(`${a} needs a value.`);o[a==='--skill-dir'?'skillDir':'python']=args[i];}
  else if(a==='--help'||a==='-h')o.help=true;else throw Error(`Unknown option: ${a}`);
 }
 if(o.check&&o.dryRun)throw Error('Choose --check or --dry-run, not both.');
 if(o.downloadModel&&(o.check||o.dryRun||o.skipInstall))throw Error('--download-whisper-model requires normal install mode.');
 return o;
}
async function command(executable,args,{env=process.env,stream=false,allowFailure=false}={}){
 return await new Promise((resolve,reject)=>{
  const child=spawn(executable,args,{cwd:projectRoot,env,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
  child.stdout.on('data',b=>{stdout+=b;if(stream)process.stdout.write(b);});child.stderr.on('data',b=>{stderr+=b;if(stream)process.stderr.write(b);});
  child.on('error',e=>allowFailure?resolve({ok:false,status:null,stdout,stderr:e.message}):reject(e));
  child.on('close',status=>{const result={ok:status===0,status,stdout,stderr};if(!result.ok&&!allowFailure)reject(Error(`${executable} ${args.join(' ')} failed (${status}): ${stderr.trim().slice(-1800)}`));else resolve(result);});
 });
}
async function nodePackages(){
 const pkg=JSON.parse(await fs.readFile(path.join(projectRoot,'package.json'),'utf8')),lock=JSON.parse(await fs.readFile(path.join(projectRoot,'package-lock.json'),'utf8')),checks=[];
 for(const [name,version] of Object.entries(pkg.dependencies||{})){
  let installed=null;try{installed=JSON.parse(await fs.readFile(path.join(projectRoot,'node_modules',name,'package.json'),'utf8')).version;}catch{}
  const locked=lock.packages?.[`node_modules/${name}`]?.version,rootLocked=lock.packages?.['']?.dependencies?.[name];
  checks.push({name,requested:version,locked,installed,ok:installed===locked&&rootLocked===version});
 }
 return {ok:checks.every(c=>c.ok),checks,lockSha256:sha(await fs.readFile(path.join(projectRoot,'package-lock.json')))};
}
async function makeToolLink(name,target){
 const link=path.join(projectRoot,'.tools/bin',name),stat=await exists(link),relative=path.relative(path.dirname(link),target);
 if(stat){
  if(!stat.isSymbolicLink())throw Error(`Refusing to replace a non-symlink tool: ${link}`);
  if(await fs.readlink(link)===relative)return;
  // Preserve a stale local link instead of deleting anything.
  const backup=link+`.previous-${Date.now()}`;await fs.rename(link,backup);
 }
 await fs.symlink(relative,link);
}
export async function prepareToolBinary(root,binary,{readonly=false}={}){
 await assertDirectoryAncestry(root,['node_modules']);
 const modules=await fs.realpath(path.join(root,'node_modules')),physical=await fs.realpath(binary),inside=path.relative(modules,physical),stat=await fs.stat(physical);
 if(!inside||inside==='..'||inside.startsWith('..'+path.sep)||path.isAbsolute(inside)||!stat.isFile())throw Error('Installer binary must be a regular file inside this checkout node_modules.');
 let executable=true;try{await fs.access(physical,fsConstants.X_OK);}catch{executable=false;}
 if(!executable&&readonly)return {status:'NON_EXECUTABLE',path:physical,permissionsAdjusted:false};
 if(!executable)await fs.chmod(physical,stat.mode|0o111);
 return {status:'PASS',path:physical,permissionsAdjusted:!executable};
}
function pythonEnvironment(toolBin){return {...process.env,PATH:`${toolBin}${path.delimiter}${process.env.PATH||''}`,PYTHONDONTWRITEBYTECODE:'1',PYTHONNOUSERSITE:'1',NUMBA_CACHE_DIR:path.join(projectRoot,'.cache/numba'),MPLCONFIGDIR:path.join(projectRoot,'.cache/matplotlib')};}
async function choosePython(preferred){
 for(const candidate of [...new Set([preferred,'python3.12','python3'].filter(Boolean))]){
  const r=await command(candidate,['-c','import json,sys,platform; print(json.dumps({"version":list(sys.version_info[:3]),"machine":platform.machine()}))'],{allowFailure:true});
  if(r.ok){const data=JSON.parse(r.stdout);if(data.version[0]===3&&data.version[1]===12)return {executable:candidate,...data};}
 }
 throw Error('Python3.12 is required for the scoped macOS arm64 lock. Install it separately or pass --python /path/to/python3.12. Existing environments are not replaced.');
}
async function pythonPackages(python,env){
 const code=`import importlib.metadata as m,json,pathlib,re,sys,platform
p=pathlib.Path('requirements-lock-macos-arm64.txt'); rows=[]
for line in p.read_text().splitlines():
 line=line.strip()
 if not line or line.startswith('#'): continue
 name,want=line.split('==',1)
 try: got=m.version(name)
 except m.PackageNotFoundError: got=None
 rows.append({'name':name,'expected':want,'installed':got,'ok':got==want})
print(json.dumps({'ok':all(r['ok'] for r in rows),'python':list(sys.version_info[:3]),'machine':platform.machine(),'packages':rows}))`;
 const r=await command(python,['-B','-c',code],{env,allowFailure:true});return r.ok?JSON.parse(r.stdout):{ok:false,error:r.stderr};
}
export async function setup(options){
 const report={schemaVersion:1,mode:options.check?'check':options.dryRun?'dry-run':'setup',platform:process.platform,architecture:process.arch,checks:[],warnings:[],actions:[],mediaGenerated:false,paidJobsSubmitted:false,credentialsCreated:false,gitActions:false};
 const readonly=options.check||options.dryRun;
 const record=(name,status,detail)=>report.checks.push({name,status,detail});
 // Inspect every setup-owned ancestry before any install, mkdir, chmod or sync.
 await assertDirectoryAncestry(projectRoot,[...LOCAL_DIRS,'node_modules','.venv',process.platform==='win32'?'.venv/Scripts':'.venv/bin']);
 if(Number(process.versions.node.split('.')[0])<22)throw Error(`Node >=22 required; found ${process.version}.`);
 record('node','PASS',process.version);
 const npm=await command(process.platform==='win32'?'npm.cmd':'npm',['--version']);record('npm','PASS',npm.stdout.trim());
 const skill=await validateSkill();record('maintained_skill','PASS',{files:skill.files.length,sourceTreeSha256:skill.sourceTreeSha256});
 if(process.platform!=='darwin'||process.arch!=='arm64')report.warnings.push('Dependency lock is validated on macOS Apple Silicon/Python3.12; this platform needs its own restoration evidence.');
 let node=await nodePackages();
 if(!node.ok){
  report.actions.push('npm ci --ignore-scripts --no-audit --no-fund');
  if(!readonly&&!options.skipInstall){
   if(await exists(path.join(projectRoot,'node_modules'))&&!options.restoreNode)throw Error('Existing node_modules differs from the lock. Inspect it; use --restore-node explicitly to allow a clean npm dependency restore. No existing package directory was removed.');
   console.log('Restoring locked Node packages (lifecycle scripts disabled).');await command('npm',['ci','--ignore-scripts','--no-audit','--no-fund'],{stream:true});node=await nodePackages();
  }
 }
 record('node_dependencies',node.ok?'PASS':'MISSING',node);
 if(!readonly)for(const directory of LOCAL_DIRS)await fs.mkdir(path.join(projectRoot,directory),{recursive:true});
 record('local_directories',readonly?(await Promise.all(LOCAL_DIRS.map(d=>exists(path.join(projectRoot,d))))).every(Boolean)?'PASS':'MISSING':'PASS',LOCAL_DIRS);
 const tools={};
 if(node.ok){
  for(const [name,pkg] of [['ffmpeg','@ffmpeg-installer/ffmpeg'],['ffprobe','@ffprobe-installer/ffprobe']]){
   const binary=require(pkg).path,prepared=await prepareToolBinary(projectRoot,binary,{readonly});
   if(prepared.status!=='PASS'){record(name,prepared.status,prepared);continue;}
   const r=await command(binary,['-version']);tools[name]=binary;record(name,'PASS',{version:r.stdout.split('\n')[0],permissionsAdjusted:prepared.permissionsAdjusted});if(!readonly)await makeToolLink(name,binary);
  }
 }else record('ffmpeg_ffprobe','MISSING','Restore locked Node packages to obtain platform binaries.');
 const bin=path.join(projectRoot,'.tools/bin'),env=pythonEnvironment(bin);
 // Read-only checks can use installer binary directories without preparing symlinks.
 env.PATH=[...new Set(Object.values(tools).map(p=>path.dirname(p))),bin,process.env.PATH||''].join(path.delimiter);
 const venvPython=path.join(projectRoot,'.venv',process.platform==='win32'?'Scripts/python.exe':'bin/python');let pythonReady=Boolean(await exists(venvPython));
 if(!pythonReady){
  report.actions.push('Create project .venv with Python3.12; install requirements-production.txt');
  if(!readonly&&!options.skipInstall){const chosen=await choosePython(options.python);console.log(`Creating project Python environment with ${chosen.executable}.`);await command(chosen.executable,['-m','venv',path.join(projectRoot,'.venv')],{stream:true});pythonReady=true;}
 }
 let py=pythonReady?await pythonPackages(venvPython,env):{ok:false,error:'Project .venv is absent.'};
 if(pythonReady&&py.python&&(py.python[0]!==3||py.python[1]!==12))throw Error('Existing .venv uses a different Python minor version. Preserve it and select a fresh checkout/environment; setup will not delete it.');
 if(pythonReady&&!py.ok&&!readonly&&!options.skipInstall){
  if(process.platform!=='darwin'||process.arch!=='arm64')throw Error('Automatic Python dependency installation is limited to the validated macOS arm64 lock; create/review a platform-specific lock first.');
  console.log('Installing only scoped production Python requirements.');await command(venvPython,['-m','pip','install','-r','requirements-production.txt'],{env,stream:true});py=await pythonPackages(venvPython,env);
 }
 record('python_dependencies',py.ok?'PASS':'MISSING',py);
 if(py.ok&&node.ok){
  const pip=await command(venvPython,['-m','pip','check'],{env});record('python_dependency_consistency','PASS',pip.stdout.trim());
  const verify=await command(venvPython,['-B','scripts/transcribe.py','--validate-install','--profile','production'],{env});const data=JSON.parse(verify.stdout);if(data.model!=='medium'||!data.wordTimestamps)throw Error('BAY REFEREE requires medium + native word timestamps.');record('whisper_install_profile','PASS',data);
  if(options.downloadModel){console.log('Preparing local Whisper medium weights; no speech is transcribed.');await command(venvPython,['-B','-c',"import whisper; whisper.load_model('medium',device='cpu',download_root='.cache/whisper'); print('medium cache ready')"],{env,stream:true});}
  const cache=await command(venvPython,['-B','-c',`import hashlib,json,pathlib,whisper
p=pathlib.Path('.cache/whisper/medium.pt'); expected=whisper._MODELS['medium'].split('/')[-2]; actual=None
if p.is_file():
 with p.open('rb') as f: actual=hashlib.file_digest(f,'sha256').hexdigest()
print(json.dumps({'model':'medium','path':'.cache/whisper/medium.pt','present':p.is_file(),'bytes':p.stat().st_size if p.is_file() else 0,'sha256_matches_provider':actual==expected if actual else False}))`],{env});
  const weights=JSON.parse(cache.stdout);record('whisper_cache',weights.sha256_matches_provider?'PASS':'NOT_CACHED',weights);if(!weights.sha256_matches_provider)report.warnings.push('Whisper medium weights are absent/unverified. Run setup with --download-whisper-model before the first transcription; cache files are never stored in Git.');
 }
 const skillResult=await synchronizeSkill({target:options.skillDir,check:options.check,dryRun:options.dryRun});record('installed_skill',skillResult.status,skillResult);
 if(!options.skipSmoke&&node.ok){
  const entry=path.join(projectRoot,'scripts/portable-smoke.mjs');
  if(await exists(entry)){const smoke=await command(process.execPath,[entry],{env,allowFailure:true});record('portable_import_only_smoke',smoke.ok?'PASS':'FAIL',smoke.stdout.trim()||smoke.stderr.trim());}
  else record('portable_import_only_smoke','MISSING','scripts/portable-smoke.mjs is required in the portable source set.');
 }else record('portable_import_only_smoke','NOT_RUN',options.skipSmoke?'Explicit --skip-smoke':'Node dependencies are missing.');
 report.higgsfield={status:'MANUAL_CONNECTION_REQUIRED',integration:'Official Codex Higgsfield connector',instruction:'Sign in to the intended workspace and confirm its Engin custom voice is available. Setup does not inspect/create credentials, validate remote account access or submit generation jobs.'};
 report.sourceAssets={manifest:'config/bay-referee-portable-assets.json',licensedLocalSfx:[],instruction:'Import-only smoke checks repository source assets. Licensed audio is local-cache-only; missing sound sources do not fail an import check. No audio/picture/cover is generated here.'};
 const assetManifestPath=path.join(projectRoot,report.sourceAssets.manifest);
 if(await exists(assetManifestPath)){
  const manifest=JSON.parse(await fs.readFile(assetManifestPath,'utf8'));
  for(const asset of manifest.sfx||[]){
   const relative=path.join(manifest.paths.default_cache,asset.cache_relative_path),filename=path.resolve(projectRoot,relative),within=path.relative(projectRoot,filename);
   if(within==='..'||within.startsWith('..'+path.sep)||path.isAbsolute(within))throw Error('Local sound cache path escapes checkout.');
   const present=await exists(filename);let status='NOT_CACHED';
   if(present){const bytes=await fs.readFile(filename);status=bytes.length===asset.bytes&&sha(bytes)===asset.sha256?'VERIFIED':'MISMATCH';}
   report.sourceAssets.licensedLocalSfx.push({id:asset.id,path:relative,status,requiredForBrandClosure:Boolean(asset.required_for_brand_closure)});
  }
  if(report.sourceAssets.licensedLocalSfx.some(a=>a.requiredForBrandClosure&&a.status!=='VERIFIED'))report.warnings.push('The approved closing-whistle source must be acquired into the private local asset cache before full branded production. Setup never downloads or redistributes it.');
 }else report.warnings.push('Portable source asset manifest is missing.');
 const failures=report.checks.filter(c=>['FAIL','MISSING','SYNC_REQUIRED','NON_EXECUTABLE'].includes(c.status));
 report.status=options.dryRun?'DRY_RUN':failures.length?'SETUP_INCOMPLETE':options.skipSmoke?'SETUP_WITH_SMOKE_SKIPPED':'PASS_LOCAL_SETUP';
 report.localRuntimeReady=report.status==='PASS_LOCAL_SETUP'&&report.checks.some(c=>c.name==='whisper_cache'&&c.status==='PASS');
 report.productionReady=false;
 report.productionReadiness='REQUIRES_LIVE_HIGGSFIELD_CONNECTION_AND_LICENSED_ASSET_CONFIRMATION';
 report.productionReadyNote='Local readiness does not establish Higgsfield account access, optional licensed SFX availability or human approval of any episode.';
 if(!readonly)await fs.writeFile(path.join(projectRoot,'.cache/setup/bay-referee-setup.json'),JSON.stringify(report,null,2)+'\n');
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===HERE){
 try{const options=parseOptions(process.argv.slice(2));if(options.help)console.log(HELP);else{const report=await setup(options);console.log(JSON.stringify(report,null,2));if(report.status==='SETUP_INCOMPLETE')process.exitCode=1;}}
 catch(error){console.error(`SETUP_FAILED: ${error.message}`);process.exitCode=1;}
}
