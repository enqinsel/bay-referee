import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {initializeEpisode} from '../scripts/bay-referee-new-episode.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateRelative = 'brand/bay-referee/production-template';
const createdAt = '2026-10-15T12:00:00.000Z';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bay-referee-scaffold-'));
  t.after(() => fs.rm(root, {recursive: true, force: true}));
  await fs.mkdir(path.join(root, 'brand/bay-referee'), {recursive: true});
  await fs.cp(path.join(project, templateRelative), path.join(root, templateRelative), {recursive: true});
  return root;
}

async function absent(filename) {
  await assert.rejects(fs.lstat(filename), {code: 'ENOENT'});
}

async function walk(root, prefix = '') {
  const output = {};
  for (const entry of await fs.readdir(path.join(root, prefix), {withFileTypes: true})) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      output[relative + '/'] = 'directory';
      Object.assign(output, await walk(root, relative));
    } else if (entry.isSymbolicLink()) output[relative] = {symlink: await fs.readlink(path.join(root, relative))};
    else output[relative] = await fs.readFile(path.join(root, relative), 'utf8');
  }
  return output;
}

test('actual production template scaffolds exactly the declared blank contract, without media or timings', async t => {
  const root = await fixture(t);
  const layout = JSON.parse(await fs.readFile(path.join(root, templateRelative, 'layout.json'), 'utf8'));
  const result = await initializeEpisode({projectRoot: root, slug: 'production-smoke-test', createdAt});
  assert.equal(result.mediaGenerated, false);
  const output = await walk(result.directory);
  assert.deepEqual(Object.keys(output).sort(), [...layout.directories.map(item => item + '/'), ...layout.files.map(item => item.path.replaceAll('{{slug}}', result.slug))].sort());
  assert.equal(output['01_script/script-tr.txt'], '');
  assert.equal(output['06_social/instagram-caption.txt'], '');
  assert(!Object.keys(output).some(item => /\.(mp4|mp3|wav|png|srt)$/.test(item) || /(?:whisper|word-map)-/.test(item)));
  const episode = JSON.parse(output['00_brief/episode.json']);
  const manifest = JSON.parse(output['08_delivery/manifest.json']);
  assert.equal(episode.slug, result.slug);
  assert.equal(manifest.slug, result.slug);
  assert.equal(manifest.generated_at, null);
  assert.equal(manifest.video.duration_seconds, null);
  assert(Object.values(manifest.files).every(file => file.status === 'PLANNED' && file.sha256 === null));
  assert.equal(JSON.stringify(output).includes('{{'), false);
});

test('unsafe or ambiguous slug values perform no writes', async t => {
  const root = await fixture(t);
  const before = await walk(root);
  for (const slug of ['', '../outside', '/absolute', 'file.mp4', 'UPPER', 'türkçe', '-start', 'end-', 'two--parts', 'a/b', 'a\\b', 'a b', 'a\0b', 'x'.repeat(81)]) {
    await assert.rejects(initializeEpisode({projectRoot: root, slug, createdAt}), {code: 'INVALID_SLUG'});
  }
  assert.deepEqual(await walk(root), before);
});

test('existing directory, regular file, and dangling symlink stay untouched', async t => {
  const root = await fixture(t);
  const base = path.join(root, 'videolar');
  await fs.mkdir(base);
  await fs.mkdir(path.join(base, 'existing-directory'));
  await fs.writeFile(path.join(base, 'existing-directory/keep.txt'), 'preserve');
  await fs.writeFile(path.join(base, 'existing-file'), 'preserve');
  await fs.symlink(path.join(root, 'missing-target'), path.join(base, 'existing-symlink'));
  const before = await walk(base);
  for (const slug of ['existing-directory', 'existing-file', 'existing-symlink']) {
    await assert.rejects(initializeEpisode({projectRoot: root, slug, createdAt}), {code: 'ALREADY_EXISTS'});
  }
  assert.deepEqual(await walk(base), before);
});

test('concurrent initializers reserve a slug once and cannot overwrite the winner', async t => {
  const root = await fixture(t);
  const attempts = await Promise.allSettled(Array.from({length: 6}, () => initializeEpisode({projectRoot: root, slug: 'race-test', createdAt})));
  assert.equal(attempts.filter(item => item.status === 'fulfilled').length, 1);
  assert(attempts.filter(item => item.status === 'rejected').every(item => item.reason.code === 'ALREADY_EXISTS'));
  const winner = attempts.find(item => item.status === 'fulfilled').value;
  assert.equal(Object.keys(await walk(winner.directory)).length, winner.files + winner.directories);
});

test('a videolar symlink cannot redirect writes outside the project', async t => {
  const root = await fixture(t);
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'bay-referee-outside-'));
  t.after(() => fs.rm(outside, {recursive: true, force: true}));
  await fs.symlink(outside, path.join(root, 'videolar'));
  await assert.rejects(initializeEpisode({projectRoot: root, slug: 'safe-slug', createdAt}), {code: 'UNSAFE_PATH'});
  assert.deepEqual(await fs.readdir(outside), []);
});

test('template source symlinks and unsafe layout paths fail before target or base creation', async t => {
  for (const mutation of ['symlink-file', 'symlink-directory', 'output-traversal', 'source-traversal', 'fake-media', 'unknown-token', 'bad-json']) {
    const root = await fixture(t);
    const template = path.join(root, templateRelative);
    const layoutPath = path.join(template, 'layout.json');
    const layout = JSON.parse(await fs.readFile(layoutPath, 'utf8'));
    if (mutation === 'symlink-file') {
      const source = path.join(template, layout.files[0].template);
      await fs.rename(source, source + '.kept');
      await fs.symlink(source + '.kept', source);
    } else if (mutation === 'symlink-directory') {
      await fs.rename(path.join(template, 'files'), path.join(template, 'kept-files'));
      await fs.symlink(path.join(template, 'kept-files'), path.join(template, 'files'));
    } else if (mutation === 'output-traversal') layout.files[0].path = '../escaped.txt';
    else if (mutation === 'source-traversal') layout.files[0].template = '../escaped.txt';
    else if (mutation === 'fake-media') layout.files[0].path = '03_video/fake.mp4';
    else if (mutation === 'unknown-token') await fs.writeFile(path.join(template, layout.files[0].template), '{{unexpected}}');
    else if (mutation === 'bad-json') {
      const jsonFile = layout.files.find(item => item.path.endsWith('.json'));
      await fs.writeFile(path.join(template, jsonFile.template), '{not json}');
    }
    await fs.writeFile(layoutPath, JSON.stringify(layout));
    await assert.rejects(initializeEpisode({projectRoot: root, slug: 'safe-slug', createdAt}), error => ['UNSAFE_PATH', 'INVALID_TEMPLATE'].includes(error.code));
    await absent(path.join(root, 'videolar'));
  }
});

test('CLI resolves its project from script location, supports help, and rejects --force', async t => {
  const root = await fixture(t);
  await fs.mkdir(path.join(root, 'scripts'));
  const script = path.join(root, 'scripts/bay-referee-new-episode.mjs');
  await fs.copyFile(path.join(project, 'scripts/bay-referee-new-episode.mjs'), script);
  const unrelatedCwd = await fs.mkdtemp(path.join(os.tmpdir(), 'bay-referee-cwd-'));
  t.after(() => fs.rm(unrelatedCwd, {recursive: true, force: true}));
  const help = spawnSync(process.execPath, [script, '--help'], {cwd: unrelatedCwd, encoding: 'utf8'});
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /No voice, video, cover, SRT, alignment or network job/);
  await absent(path.join(root, 'videolar'));
  const force = spawnSync(process.execPath, [script, 'cli-test', '--force'], {cwd: unrelatedCwd, encoding: 'utf8'});
  assert.equal(force.status, 2);
  await absent(path.join(root, 'videolar'));
  const created = spawnSync(process.execPath, [script, 'cli-test'], {cwd: unrelatedCwd, encoding: 'utf8'});
  assert.equal(created.status, 0, created.stderr);
  assert.equal((await fs.stat(path.join(root, 'videolar/cli-test/08_delivery/manifest.json'))).isFile(), true);
  assert.deepEqual(await fs.readdir(unrelatedCwd), []);
  const before = await walk(path.join(root, 'videolar/cli-test'));
  const collision = spawnSync(process.execPath, [script, 'cli-test'], {cwd: unrelatedCwd, encoding: 'utf8'});
  assert.equal(collision.status, 1);
  assert.match(collision.stderr, /ALREADY_EXISTS/);
  assert.deepEqual(await walk(path.join(root, 'videolar/cli-test')), before);
});
