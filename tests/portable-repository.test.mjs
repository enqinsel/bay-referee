import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {auditCandidates,scanText} from '../scripts/portable-source-audit.mjs';
import {validateSkill,synchronizeSkill,defaultSkillDirectory} from '../scripts/skill-bay-referee.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const git=(args,input)=>spawnSync('git',args,{cwd:root,input,encoding:'utf8'});

test('production outputs, private evidence and caches are ignored while reusable source remains visible',async()=>{
  const ignored=['videolar/example/03_video/final.mp4','node_modules/a/index.js','.venv/bin/python','.cache/whisper/medium.pt','brand/bay-referee/production/backpass-1992/v1/video/tr/a.mp4','voice/reference/raw/benimses.wav','mascot/engin-avatar-v1/provenance/user-identity-reference.png','audio/sfx/football-core-v1-1/raw/player-field/example.wav','.env'];
  for(const p of ignored)assert.equal(git(['check-ignore','--no-index',p]).status,0,p+' must be ignored');
  const manifest=await read('docs/portable-repo-manifest.json');
  const result=git(['check-ignore','--no-index','--stdin'],manifest.candidates.map(x=>x.path).join('\n')+'\n');
  assert.equal(result.status,1,'Required source accidentally ignored: '+result.stdout+result.stderr);
});

test('manifest resolves every source candidate without symlinks, large files or private payloads',async()=>{
  const manifest=await read('docs/portable-repo-manifest.json');
  assert.equal(manifest.review_required.length,0);
  const known=new Set(['REQUIRED_IN_GIT','REQUIRED_BUT_LFS_CANDIDATE','LOCAL_REGENERATABLE','LOCAL_PRODUCTION_OUTPUT','R&D_ARCHIVE','SECRET_OR_PRIVATE','REVIEW_REQUIRED']);
  for(const group of manifest.groups){assert(known.has(group.classification));assert(group.reason);assert(group.bootstrap_or_rebuild);assert(Number.isFinite(group.estimated_bytes));}
  for(const item of manifest.candidates){const stat=await fs.lstat(path.join(root,item.path));assert(stat.isFile()&&!stat.isSymbolicLink(),item.path);assert(stat.size<25*1024**2,item.path+' exceeded warning threshold');}
  assert.equal(manifest.proposed_lfs_bytes,0);
});

test('runtime import graph closes inside the selected source tree or declared npm packages',async()=>{
  const manifest=await read('docs/portable-repo-manifest.json'),candidates=new Set(manifest.candidates.map(f=>f.path));
  const pkg=await read('package.json');
  for(const item of manifest.candidates.filter(f=>f.path.endsWith('.mjs')||f.path.endsWith('.js'))){
    const source=await fs.readFile(path.join(root,item.path),'utf8');
    for(const m of source.matchAll(/(?:\bfrom\s*|\bimport\s*)['"]([^'"]+)['"]/g)){
      const spec=m[1];if(spec.startsWith('node:'))continue;
      if(spec.startsWith('.')){const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(item.path),spec));assert(candidates.has(resolved),`${item.path} imports excluded source ${resolved}`);}
      else {const dep=spec.startsWith('@')?spec.split('/').slice(0,2).join('/'):spec.split('/')[0];assert(pkg.dependencies[dep],`${item.path} uses undeclared ${dep}`);}
    }
  }
});

test('skill sync validates hashes, is idempotent, preserves extras and backs up changed managed text',async()=>{
  const sandbox=await fs.mkdtemp(path.join(os.tmpdir(),'bay-portable-skill-'));
  const target=path.join(sandbox,'with spaces','bay-referee');
  const source=await validateSkill();assert(source.localReferences>0);
  const first=await synchronizeSkill({root,target});assert.equal(first.status,'PASS');assert(first.changedFiles.length>0);
  await fs.writeFile(path.join(target,'personal-note.txt'),'preserve this extra');
  const again=await synchronizeSkill({root,target});assert.deepEqual(again.changedFiles,[]);assert(again.retainedExtraFiles.includes('personal-note.txt'));
  await fs.appendFile(path.join(target,'SKILL.md'),'\nLocal test modification.\n');
  const check=await synchronizeSkill({root,target,check:true});assert.equal(check.status,'SYNC_REQUIRED');
  const repaired=await synchronizeSkill({root,target});assert.equal(repaired.status,'PASS');assert.equal(await fs.readFile(path.join(target,'personal-note.txt'),'utf8'),'preserve this extra');
  assert.equal(defaultSkillDirectory({CODEX_HOME:path.join(sandbox,'codex')},'/unused'),path.join(sandbox,'codex/skills/bay-referee'));
  // Test-owned fixtures intentionally retained; no old data is removed in this phase.
});

test('secret detection catches representative credential/private URL shapes without retaining values',()=>{
  const key='sk-'+'A'.repeat(30),bearer='Bearer '+'b'.repeat(30),url='https://d.example.cloudfront.net/'+'user_abc/private.mp3';
  assert(scanText(key).some(x=>x.issue==='provider-key'));
  assert(scanText(bearer).some(x=>x.issue==='bearer-value'));
  assert(scanText(url).some(x=>x.issue==='private-provider-url'));
  assert.deepEqual(scanText('VOICE_ID=logical-workspace-reference\n# no credentials'),[]);
  assert(scanText(key).every(x=>Object.keys(x).sort().join(',')==='issue,line'));
});

test('proposed candidate scan has no unresolved secret, absolute runtime or collision findings',()=>{
  const result=auditCandidates(root);assert.equal(result.status,'PASS',JSON.stringify(result.issues));assert.deepEqual(result.absolute_runtime,[]);
});

test('exporter refuses an existing destination without changing its content',async()=>{
  const destination=await fs.mkdtemp(path.join(os.tmpdir(),'bay-export-preserve-'));await fs.writeFile(path.join(destination,'keep.txt'),'unchanged');
  const result=spawnSync('python3',['scripts/portable-repo-export.py','--destination',destination],{cwd:root,encoding:'utf8'});
  assert.notEqual(result.status,0);assert.equal(await fs.readFile(path.join(destination,'keep.txt'),'utf8'),'unchanged');assert.deepEqual(await fs.readdir(destination),['keep.txt']);
});

test('exporter rejects traversal and symlink ancestors before creating an output directory',async()=>{
  const sandbox=await fs.mkdtemp(path.join(os.tmpdir(),'bay-export-alias-'));
  const alias=path.join(sandbox,'alias');await fs.symlink(root,alias);
  for(const destination of [path.join(alias,'forbidden-export'),sandbox+'/../forbidden-export']){
    const result=spawnSync('python3',['scripts/portable-repo-export.py','--destination',destination],{cwd:root,encoding:'utf8'});
    assert.notEqual(result.status,0);assert.match(result.stderr,/symlink|traversal/i);
  }
  await assert.rejects(fs.access(path.join(root,'forbidden-export')));
});
