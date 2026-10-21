import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import Ajv2020 from 'ajv/dist/2020.js';
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
  for (const language of ['tr', 'en', 'es']) {
    for (const kind of ['title', 'description', 'hashtags']) assert.equal(output[`06_social/${kind}-${language}.txt`], '');
  }
  for (const oldFile of ['instagram-caption', 'youtube-description', 'youtube-title', 'hashtags']) assert.equal(output[`06_social/${oldFile}.txt`], undefined);
  assert(!Object.keys(output).some(item => /\.(mp4|mp3|wav|png|srt)$/.test(item) || /(?:whisper|word-map)-/.test(item)));
  const episode = JSON.parse(output['00_brief/episode.json']);
  const manifest = JSON.parse(output['08_delivery/manifest.json']);
  assert.equal(episode.slug, result.slug);
  assert.equal(manifest.slug, result.slug);
  assert.equal(manifest.schema_version, 2);
  assert.equal(manifest.generated_at, null);
  assert.equal(manifest.video.duration_seconds, null);
  assert(Object.values(manifest.files).every(file => file.status === 'PLANNED' && file.sha256 === null));
  assert(Object.values(manifest.qa.checks).every(check => check === 'NOT_RUN'));
  const semantic = JSON.parse(output['08_delivery/semantic-sync.json']);
  assert.equal(semantic.master_sha256, null);
  assert(Object.values(semantic.languages).every(review => review.status === 'NOT_RUN' && review.meaning_preserved === null && review.reviewed_by === null));
  for (const language of ['en', 'es']) {
    assert.equal(manifest.audio_packages[language].kind, 'youtube_dub');
    for (const format of ['wav', 'mp3']) {
      assert.equal(manifest.files[`youtube_dub_${language}_${format}`].path, `02_audio/${language}/youtube-dub-${language}.${format}`);
      assert.equal(manifest.audio_packages[language].duration_seconds[format], null);
    }
    assert.equal(manifest.caption_timing[language].authority.audio_path, `02_audio/${language}/youtube-dub-${language}.wav`);
    assert.notEqual(manifest.caption_timing[language].authority.word_map_path, manifest.audio_packages[language].native.word_map_path);
  }
  for (const language of ['tr', 'en', 'es']) assert.equal(manifest.files[`cover_${language}`].path, `05_cover/cover-${language}-1080x1920.png`);
  assert(!['cover_reels', 'cover_youtube', 'instagram_caption', 'youtube_title', 'youtube_description', 'hashtags'].some(key => key in manifest.files));
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
  await fs.symlink(path.join(project, 'node_modules'), path.join(root, 'node_modules'));
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

test('invalid version or completion claims in a template fail before writing any episode', async t => {
  for (const mutation of ['old-layout', 'old-manifest', 'missing-dub', 'missing-cover', 'missing-social-scaffold', 'fake-gate', 'fake-generated', 'fake-duration', 'fake-semantic-review']) {
    const root = await fixture(t);
    const base = path.join(root, templateRelative);
    const layoutPath = path.join(base, 'layout.json');
    const manifestPath = path.join(base, 'files/08_delivery/manifest.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    if (mutation === 'old-layout') {
      const layout = JSON.parse(await fs.readFile(layoutPath, 'utf8'));
      layout.schema_version = 1;
      await fs.writeFile(layoutPath, JSON.stringify(layout));
    } else if (mutation === 'missing-social-scaffold') {
      const layout = JSON.parse(await fs.readFile(layoutPath, 'utf8'));
      layout.files = layout.files.filter(file => file.path !== '06_social/title-es.txt');
      await fs.writeFile(layoutPath, JSON.stringify(layout));
    } else if (mutation === 'fake-semantic-review') {
      const semanticPath = path.join(base, 'files/08_delivery/semantic-sync.json');
      const semantic = JSON.parse(await fs.readFile(semanticPath, 'utf8'));
      semantic.languages.es.meaning_preserved = true;
      await fs.writeFile(semanticPath, JSON.stringify(semantic));
    } else if (mutation === 'old-manifest') manifest.schema_version = 1;
    else if (mutation === 'missing-dub') delete manifest.files.youtube_dub_es_mp3;
    else if (mutation === 'missing-cover') delete manifest.files.cover_en;
    else if (mutation === 'fake-gate') manifest.audio_packages.en.qa.DUB_DURATION_GATE = 'PASS';
    else if (mutation === 'fake-generated') manifest.files.cover_tr.status = 'GENERATED';
    else if (mutation === 'fake-duration') manifest.audio_packages.es.duration_seconds.wav = 60;
    await fs.writeFile(manifestPath, JSON.stringify(manifest));
    await assert.rejects(initializeEpisode({projectRoot: root, slug: 'safe-slug', createdAt}), {code: 'INVALID_TEMPLATE'}, mutation);
    await absent(path.join(root, 'videolar'));
  }
});

async function manifestValidator() {
  const schema = JSON.parse(await fs.readFile(path.join(project, templateRelative, 'manifest.schema.json'), 'utf8'));
  return new Ajv2020({allErrors: true, strict: false, validateFormats: false}).compile(schema);
}

async function readyManifest() {
  // Pure in-memory schema fixture: these synthetic hashes are never registered as production evidence.
  const manifest = JSON.parse((await fs.readFile(path.join(project, templateRelative, 'files/08_delivery/manifest.json'), 'utf8')).replaceAll('{{slug}}', 'schema-fixture').replaceAll('{{created_at}}', createdAt));
  manifest.status = 'READY';
  manifest.episode = 'Schema fixture';
  manifest.generated_at = createdAt;
  for (const file of Object.values(manifest.files)) Object.assign(file, {status: 'GENERATED', sha256: 'a'.repeat(64), bytes: 1, generated_at: createdAt});
  Object.assign(manifest.voice, {status: 'GENERATED', voice_id: 'fixture'});
  manifest.video.duration_seconds = 60;
  manifest.branding.watermark = {status: 'APPLIED', asset_path: 'assets/wordmark.png'};
  manifest.branding.signoff = {status: 'APPLIED', duration_seconds: 0.9};
  manifest.research = {status: 'PASS', claims_count: 1, source_count: 1};
  manifest.qa.status = 'PASS';
  manifest.qa.checks = Object.fromEntries(Object.keys(manifest.qa.checks).map(key => [key, 'PASS']));
  manifest.qa.evidence_paths = ['08_delivery/qa-report.json'];
  manifest.qa.known_limitations = [];
  for (const [language, audio] of Object.entries(manifest.audio_packages)) {
    audio.status = 'GENERATED';
    if (language !== 'tr') {
      audio.duration_seconds = {wav: 60, mp3: 60};
      audio.timeline.padding_seconds = 2;
      audio.qa = Object.fromEntries(Object.keys(audio.qa).map(key => [key, 'PASS']));
    }
    manifest.caption_timing[language].status = 'ALIGNED';
    manifest.caption_timing[language].authority.audio_sha256 = 'a'.repeat(64);
  }
  return manifest;
}

test('READY schema requires every language and final format, metadata and all verified gates', async () => {
  const validate = await manifestValidator();
  const ready = await readyManifest();
  assert.equal(validate(ready), true, JSON.stringify(validate.errors));
  const requiredVariants = ['youtube_dub_en_wav', 'youtube_dub_en_mp3', 'youtube_dub_es_wav', 'youtube_dub_es_mp3', 'alignment_en', 'alignment_es', 'aligned_word_map_en', 'aligned_word_map_es', 'semantic_sync', 'qa_report', 'youtube_tags'];
  for (const language of ['tr', 'en', 'es']) requiredVariants.push(`cover_${language}`, `title_${language}`, `description_${language}`, `hashtags_${language}`);
  for (const key of requiredVariants) {
    const missing = structuredClone(ready);
    delete missing.files[key];
    assert.equal(validate(missing), false, `${key} cannot be absent`);
    const planned = structuredClone(ready);
    Object.assign(planned.files[key], {status: 'PLANNED', sha256: null, bytes: null, generated_at: null});
    assert.equal(validate(planned), false, `${key} cannot remain planned`);
  }
  for (const gate of ['DUB_DURATION_GATE', 'TIMELINE_GATE', 'AUDIO_POLICY_GATE', 'SEMANTIC_GATE', 'REQUIRED_FILES_GATE', 'FILE_INTEGRITY_GATE']) {
    for (const state of ['NOT_RUN', 'FAIL']) {
      const invalid = structuredClone(ready);
      invalid.qa.checks[gate] = state;
      assert.equal(validate(invalid), false, `${gate}:${state} cannot be READY`);
    }
  }
  for (const language of ['en', 'es']) {
    for (const change of [
      m => { m.audio_packages[language].duration_seconds.mp3 = null; },
      m => { m.audio_packages[language].qa.DUB_DURATION_GATE = 'FAIL'; },
      m => { m.audio_packages[language].qa.SEMANTIC_GATE = 'NOT_RUN'; },
      m => { m.audio_packages[language].timeline.start_seconds = 0.1; },
      m => { m.audio_packages[language].timeline.time_stretched = true; },
      m => { m.audio_packages[language].timeline.auto_trimmed = true; },
      m => { m.caption_timing[language].authority.audio_path = `02_audio/${language}/narration-${language}.wav`; },
      m => { m.caption_timing[language].authority.word_map_path = `02_audio/${language}/word-map-${language}.json`; },
    ]) {
      const invalid = structuredClone(ready);
      change(invalid);
      assert.equal(validate(invalid), false, JSON.stringify(invalid.audio_packages[language]));
    }
  }
});

test('schema cannot promote empty scaffolds or unreviewed semantic evidence to PASS', async () => {
  const validate = await manifestValidator();
  const scaffold = JSON.parse((await fs.readFile(path.join(project, templateRelative, 'files/08_delivery/manifest.json'), 'utf8')).replaceAll('{{slug}}', 'schema-fixture').replaceAll('{{created_at}}', createdAt));
  assert.equal(validate(scaffold), true, JSON.stringify(validate.errors));
  scaffold.status = 'READY';
  assert.equal(validate(scaffold), false);
  scaffold.status = 'IN_PROGRESS';
  scaffold.qa.status = 'PASS';
  assert.equal(validate(scaffold), false);
  const schema = JSON.parse(await fs.readFile(path.join(project, templateRelative, 'semantic-sync.schema.json'), 'utf8'));
  const review = JSON.parse(await fs.readFile(path.join(project, templateRelative, 'files/08_delivery/semantic-sync.json'), 'utf8'));
  const check = new Ajv2020({allErrors: true, strict: false, validateFormats: false}).compile(schema);
  assert.equal(check(review), true, JSON.stringify(check.errors));
  review.languages.en.status = 'PASS';
  assert.equal(check(review), false);
});
