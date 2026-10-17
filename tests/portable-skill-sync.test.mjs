import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {projectRoot,skillSourceRelative,synchronizeSkill,assertDirectoryAncestry} from '../scripts/skill-bay-referee.mjs';
import {prepareToolBinary} from '../scripts/setup-bay-referee.mjs';

async function fixture(){
  const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'bay-skill-sync-regression-'));
  const root=path.join(temporary,'checkout'),source=path.join(root,skillSourceRelative);
  await fs.mkdir(path.dirname(source),{recursive:true});
  await fs.cp(path.join(projectRoot,skillSourceRelative),source,{recursive:true});
  return {temporary,root,source};
}

test('a symlink sync marker is rejected before copying files or changing its referent',async()=>{
  const {temporary,root}=await fixture(),target=path.join(temporary,'installed');
  await fs.mkdir(target);
  const protectedFile=path.join(temporary,'protected.txt');
  await fs.writeFile(protectedFile,'must remain unchanged');
  await fs.symlink(protectedFile,path.join(target,'.sync-manifest.json'));
  await assert.rejects(()=>synchronizeSkill({root,target}),/sync marker must be a regular file/);
  assert.equal(await fs.readFile(protectedFile,'utf8'),'must remain unchanged');
  assert.deepEqual(await fs.readdir(target),['.sync-manifest.json']);
});

test('a directory sync marker is rejected before copying managed files',async()=>{
  const {temporary,root}=await fixture(),target=path.join(temporary,'installed');
  await fs.mkdir(path.join(target,'.sync-manifest.json'),{recursive:true});
  await assert.rejects(()=>synchronizeSkill({root,target}),/sync marker must be a regular file/);
  assert.deepEqual(await fs.readdir(target),['.sync-manifest.json']);
});

test('ancestor aliases cannot install into or above the maintained skill source',async()=>{
  const {temporary,root,source}=await fixture(),alias=path.join(temporary,'checkout-alias');
  await fs.symlink(root,alias);
  for(const target of [path.join(alias,skillSourceRelative),path.join(alias,skillSourceRelative,'nested'),path.join(alias,'brand')]){
    await assert.rejects(()=>synchronizeSkill({root,target}),/separate from maintained source/);
  }
  assert.equal((await fs.readdir(source)).includes('.sync-manifest.json'),false);
});

test('a separate Codex ancestor alias is supported and a second sync changes no file',async()=>{
  const {temporary,root}=await fixture(),realCodex=path.join(temporary,'actual-codex'),alias=path.join(temporary,'codex-alias');
  await fs.mkdir(realCodex);await fs.symlink(realCodex,alias);
  const target=path.join(alias,'skills','bay-referee');
  const first=await synchronizeSkill({root,target});assert.equal(first.status,'PASS');
  const marker=path.join(target,'.sync-manifest.json'),before=await fs.stat(marker);
  const second=await synchronizeSkill({root,target}),after=await fs.stat(marker);
  assert.deepEqual(second.changedFiles,[]);assert.equal(before.mtimeMs,after.mtimeMs);
  assert.equal(await fs.realpath(target),await fs.realpath(path.join(realCodex,'skills','bay-referee')));
  const check=await synchronizeSkill({root,target,check:true});assert.equal(check.status,'PASS');
});

test('local cache/tool directory aliases and non-directory ancestors are rejected',async()=>{
  for(const local of ['.cache','.tools/bin']){
    const {temporary,root}=await fixture(),outside=path.join(temporary,'outside');
    await fs.mkdir(outside);await fs.writeFile(path.join(outside,'keep.txt'),'unchanged');
    const alias=path.join(root,local);await fs.mkdir(path.dirname(alias),{recursive:true});await fs.symlink(outside,alias);
    await assert.rejects(()=>assertDirectoryAncestry(root,[`${local}/nested`]),/Unsafe local directory ancestry/);
    assert.deepEqual(await fs.readdir(outside),['keep.txt']);
  }
  const {root}=await fixture();await fs.writeFile(path.join(root,'.cache'),'regular file');
  await assert.rejects(()=>assertDirectoryAncestry(root,['.cache/setup']),/Unsafe local directory ancestry/);
});

test('skill sync refuses an unsafe backup cache before changing installed content',async()=>{
  const {temporary,root}=await fixture(),target=path.join(temporary,'installed');
  await synchronizeSkill({root,target});
  await fs.appendFile(path.join(target,'SKILL.md'),'\nLocal edit to preserve.\n');
  const before=await fs.readFile(path.join(target,'SKILL.md'),'utf8'),outside=path.join(temporary,'outside');
  await fs.mkdir(outside);await fs.symlink(outside,path.join(root,'.cache'));
  await assert.rejects(()=>synchronizeSkill({root,target}),/Unsafe local directory ancestry/);
  assert.equal(await fs.readFile(path.join(target,'SKILL.md'),'utf8'),before);
  assert.deepEqual(await fs.readdir(outside),[]);
});

test('installer execute permissions are reported read-only and restored only inside node_modules',async()=>{
  const {temporary,root}=await fixture(),folder=path.join(root,'node_modules/test-installer');
  await fs.mkdir(folder,{recursive:true});const binary=path.join(folder,'tool');
  await fs.writeFile(binary,'test fixture');await fs.chmod(binary,0o644);
  const check=await prepareToolBinary(root,binary,{readonly:true});assert.equal(check.status,'NON_EXECUTABLE');assert.equal((await fs.stat(binary)).mode&0o777,0o644);
  const ready=await prepareToolBinary(root,binary);assert.equal(ready.status,'PASS');assert.equal(ready.permissionsAdjusted,true);assert.equal((await fs.stat(binary)).mode&0o777,0o755);
  const repeat=await prepareToolBinary(root,binary);assert.equal(repeat.permissionsAdjusted,false);
  const outside=path.join(temporary,'external-tool');await fs.writeFile(outside,'unchanged');await fs.chmod(outside,0o644);
  const alias=path.join(folder,'external-alias');await fs.symlink(outside,alias);
  for(const filename of [outside,alias])await assert.rejects(()=>prepareToolBinary(root,filename),/inside this checkout node_modules/);
  assert.equal((await fs.stat(outside)).mode&0o777,0o644);
});

// Test-owned temporary fixtures are retained; historical assets are never removed.
