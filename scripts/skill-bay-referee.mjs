#!/usr/bin/env node
/** Validate/synchronize only the maintained BAY REFEREE skill; no media or network work. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const HERE=fileURLToPath(import.meta.url);
export const projectRoot=path.resolve(path.dirname(HERE),'..');
export const skillSourceRelative='brand/bay-referee/channel-skill/bay-referee';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const exists=async p=>fs.lstat(p).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));
async function physicalDestination(filename) {
  const pending=[];let current=path.resolve(filename);
  while(!(await exists(current))){pending.unshift(path.basename(current));const parent=path.dirname(current);if(parent===current)throw Error('Cannot resolve skill target ancestry.');current=parent;}
  return path.resolve(await fs.realpath(current),...pending);
}
const overlaps=(a,b)=>a===b||a.startsWith(b+path.sep)||b.startsWith(a+path.sep);
export async function assertDirectoryAncestry(root,relatives) {
  root=path.resolve(root);
  for(const relative of relatives){
    const resolved=path.resolve(root,relative),inside=path.relative(root,resolved);
    if(!inside||inside==='..'||inside.startsWith('..'+path.sep)||path.isAbsolute(inside))throw Error('Local directory must stay inside checkout.');
    let current=root;
    for(const part of inside.split(path.sep)){
      current=path.join(current,part);const stat=await exists(current);
      if(stat&&(stat.isSymbolicLink()||!stat.isDirectory()))throw Error(`Unsafe local directory ancestry: ${current}`);
    }
  }
}
export function defaultSkillDirectory(env=process.env,home=os.homedir()) {
  return path.join(env.CODEX_HOME?path.resolve(env.CODEX_HOME):path.join(home,'.codex'),'skills','bay-referee');
}
async function inventory(directory,prefix='') {
  const result=[];
  for (const entry of (await fs.readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
    if (entry.name==='.sync-manifest.json') continue;
    const relative=prefix?`${prefix}/${entry.name}`:entry.name, filename=path.join(directory,entry.name);
    if(entry.isSymbolicLink()) throw Error(`Skill symlink is not allowed: ${relative}`);
    if(entry.isDirectory())result.push(...await inventory(filename,relative));
    else if(entry.isFile()){const bytes=await fs.readFile(filename);result.push({path:relative,sha256:sha(bytes),bytes:bytes.length});}
    else throw Error(`Skill entry is not a regular file/directory: ${relative}`);
  }
  return result;
}
export async function validateSkill(source=path.join(projectRoot,skillSourceRelative)) {
  source=path.resolve(source);
  const stat=await fs.lstat(source);
  if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('Skill source must be a real directory.');
  const files=await inventory(source),content=await fs.readFile(path.join(source,'SKILL.md'),'utf8');
  const match=content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if(!match)throw Error('SKILL.md needs YAML frontmatter.');
  const fields=Object.fromEntries([...match[1].matchAll(/^([a-z][a-z-]*):[ \t]*(.*)$/gm)].map(x=>[x[1],x[2].trim()]));
  const allowed=new Set(['name','description','license','allowed-tools','metadata']);
  for(const key of Object.keys(fields))if(!allowed.has(key))throw Error(`Unsupported frontmatter property: ${key}`);
  if(fields.name!=='bay-referee')throw Error('Skill name must be bay-referee.');
  if(!fields.description||fields.description.length>1024||/[<>]/.test(fields.description)||fields.description.startsWith('[TODO:'))throw Error('Skill description is missing or invalid.');
  if(/^\s*\[TODO:[^\n]*\]\s*$/m.test(content))throw Error('Skill contains unfinished scaffold instructions.');
  const links=[];
  for(const file of files.filter(f=>f.path.endsWith('.md'))) {
    const body=await fs.readFile(path.join(source,file.path),'utf8');
    if(/\/Users\/[^/\s]+\//.test(body))throw Error(`Maintained skill contains a host-specific user path: ${file.path}`);
    for(const m of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
      const target=m[1].split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;
      const absolute=path.resolve(source,path.dirname(file.path),target);
      if(!absolute.startsWith(source+path.sep))throw Error(`Skill link escapes the skill: ${file.path} → ${target}`);
      if(!(await exists(absolute)))throw Error(`Broken skill reference: ${file.path} → ${target}`);
      links.push({from:file.path,target});
    }
  }
  return {status:'PASS',name:fields.name,files,localReferences:links.length,sourceTreeSha256:sha(Buffer.from(files.map(f=>`${f.sha256}  ${f.path}\n`).join('')))};
}
async function safeParent(target,relative){
  let current=target;
  for(const part of path.dirname(relative).split(path.sep).filter(p=>p!=='.')){
    current=path.join(current,part);const stat=await exists(current);
    if(stat&&(stat.isSymbolicLink()||!stat.isDirectory()))throw Error(`Unsafe skill target parent: ${current}`);
    if(!stat)await fs.mkdir(current);
  }
}
export async function synchronizeSkill({root=projectRoot,target=defaultSkillDirectory(),check=false,dryRun=false}={}) {
  const source=path.resolve(root,skillSourceRelative);target=path.resolve(target);
  if(overlaps(source,target)||overlaps(await fs.realpath(source),await physicalDestination(target)))throw Error('Installed skill target must be separate from maintained source.');
  const validation=await validateSkill(source),targetStat=await exists(target);
  if(targetStat&&(targetStat.isSymbolicLink()||!targetStat.isDirectory()))throw Error('Installed skill target must be a real directory.');
  const marker=path.join(target,'.sync-manifest.json'),markerStat=await exists(marker);
  if(markerStat&&(markerStat.isSymbolicLink()||!markerStat.isFile()))throw Error('Installed skill sync marker must be a regular file.');
  if(targetStat){const entry=await exists(path.join(target,'SKILL.md'));if(entry){const text=await fs.readFile(path.join(target,'SKILL.md'),'utf8');if(!/^name:\s*bay-referee\s*$/m.test(text))throw Error('Refusing to replace another skill.');}}
  const existing=targetStat?await inventory(target):[],byPath=new Map(existing.map(f=>[f.path,f]));
  const changes=validation.files.filter(f=>byPath.get(f.path)?.sha256!==f.sha256),extras=existing.filter(f=>!validation.files.some(s=>s.path===f.path));
  const report={status:changes.length?'SYNC_REQUIRED':'PASS',source:skillSourceRelative,target,sourceTreeSha256:validation.sourceTreeSha256,managedFiles:validation.files.length,changedFiles:changes.map(f=>f.path),retainedExtraFiles:extras.map(f=>f.path),validation,destructiveDeletion:false};
  if(check||dryRun)return {...report,mode:check?'check':'dry-run'};
  await assertDirectoryAncestry(root,['.cache/skill-backups']);
  if(!targetStat)await fs.mkdir(target,{recursive:true});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const backupDirectory=path.join(root,'.cache/skill-backups',`${stamp}-${validation.sourceTreeSha256.slice(0,10)}`);
  for(const file of changes){
    const dest=path.join(target,file.path);await safeParent(target,file.path);const prior=await exists(dest);
    if(prior){
      if(!prior.isFile()||prior.isSymbolicLink())throw Error(`Unsafe target skill file: ${file.path}`);
      const backup=path.join(backupDirectory,file.path);
      await fs.mkdir(path.dirname(backup),{recursive:true});await fs.copyFile(dest,backup);report.backupDirectory=path.relative(root,backupDirectory);
    }
    await fs.copyFile(path.join(source,file.path),dest);
  }
  const actual=new Map((await inventory(target)).map(f=>[f.path,f.sha256]));
  if(!validation.files.every(f=>actual.get(f.path)===f.sha256))throw Error('Installed skill hashes differ after synchronization.');
  await validateSkill(target);
  const manifest=JSON.stringify({schemaVersion:1,source:skillSourceRelative,sourceTreeSha256:validation.sourceTreeSha256,files:validation.files},null,2)+'\n';
  if(!markerStat||await fs.readFile(marker,'utf8')!==manifest)await fs.writeFile(marker,manifest);
  return {...report,status:'PASS',mode:'synchronize',installedHashesMatch:true};
}
async function main(){
  const args=process.argv.slice(2);let target,check=false,dryRun=false,sourceOnly=false;
  for(let i=0;i<args.length;i++){
    if(args[i]==='--skill-dir'){if(!args[++i]||args[i].startsWith('--'))throw Error('--skill-dir needs a target folder.');target=args[i];}
    else if(args[i]==='--check')check=true;else if(args[i]==='--dry-run')dryRun=true;else if(args[i]==='--source-only')sourceOnly=true;
    else if(args[i]==='--help'){console.log('Usage: node scripts/skill-bay-referee.mjs [--check|--dry-run] [--source-only] [--skill-dir /target/bay-referee]\nDefault target: $CODEX_HOME/skills/bay-referee or ~/.codex/skills/bay-referee. Changed managed files are backed up under .cache/skill-backups; extra files are retained.');return;}
    else throw Error(`Unknown option: ${args[i]}`);
  }
  if(check&&dryRun)throw Error('Choose --check or --dry-run, not both.');
  const result=sourceOnly?await validateSkill():await synchronizeSkill({target,check,dryRun});console.log(JSON.stringify(result,null,2));if(check&&result.status!=='PASS')process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===HERE)main().catch(error=>{console.error(error.message);process.exitCode=1;});
