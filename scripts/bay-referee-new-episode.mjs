#!/usr/bin/env node
/** Create an empty production scaffold. Never generates or copies production media. */
import {constants} from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const TEMPLATE_PATH = 'brand/bay-referee/production-template';
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.json']);

export class ScaffoldError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ScaffoldError';
    this.code = code;
  }
}

function fail(code, message) {
  throw new ScaffoldError(code, message);
}

function relativePath(value, label) {
  if (typeof value !== 'string' || !value || !/^[a-z0-9_./-]+$/.test(value)) {
    fail('INVALID_TEMPLATE', `${label} must be a safe, lowercase relative POSIX path.`);
  }
  const parts = value.split('/');
  if (parts.some(part => !part || part === '.' || part === '..') || path.posix.isAbsolute(value)) {
    fail('INVALID_TEMPLATE', `${label} may not contain an absolute path, empty segment, or traversal.`);
  }
  return value;
}

async function lstatOrNull(filename) {
  try { return await fs.lstat(filename); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function assertDirectory(filename, label) {
  const stat = await fs.lstat(filename);
  if (stat.isSymbolicLink() || !stat.isDirectory()) fail('UNSAFE_PATH', `${label} must be a real directory, not a symlink.`);
}

async function readSafeTemplate(root, relative) {
  const parts = relativePath(relative, 'Template source').split('/');
  let current = root;
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    const stat = await fs.lstat(current);
    if (stat.isSymbolicLink()) fail('UNSAFE_PATH', `Template symlinks are not allowed: ${relative}`);
    if (index < parts.length - 1 && !stat.isDirectory()) fail('INVALID_TEMPLATE', `Template parent is not a directory: ${relative}`);
    if (index === parts.length - 1 && !stat.isFile()) fail('INVALID_TEMPLATE', `Template source is not a regular file: ${relative}`);
  }
  const handle = await fs.open(current, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    if (!(await handle.stat()).isFile()) fail('INVALID_TEMPLATE', `Template source is not a regular file: ${relative}`);
    return await handle.readFile('utf8');
  } finally { await handle.close(); }
}

function renderTokens(value, tokens, label) {
  const rendered = value.replace(/\{\{([^{}]+)\}\}/g, (match, token) => {
    if (!Object.hasOwn(tokens, token)) fail('INVALID_TEMPLATE', `Unknown token ${match} in ${label}.`);
    return tokens[token];
  });
  if (rendered.includes('{{') || rendered.includes('}}')) fail('INVALID_TEMPLATE', `Unresolved template token in ${label}.`);
  return rendered;
}

async function loadPlan(projectRoot, tokens) {
  const templateRoot = path.join(projectRoot, TEMPLATE_PATH);
  let current = projectRoot;
  for (const part of TEMPLATE_PATH.split('/')) {
    current = path.join(current, part);
    await assertDirectory(current, 'Template directory');
  }
  let layout;
  try { layout = JSON.parse(await readSafeTemplate(templateRoot, 'layout.json')); }
  catch (error) {
    if (error instanceof SyntaxError) fail('INVALID_TEMPLATE', 'layout.json is not valid JSON.');
    throw error;
  }
  if (layout.schema_version !== 1 || !Array.isArray(layout.directories) || !Array.isArray(layout.files)) {
    fail('INVALID_TEMPLATE', 'layout.json must use schema_version 1 with directories and files arrays.');
  }
  const directories = layout.directories.map(value => relativePath(value, 'Output directory'));
  const directorySet = new Set(directories);
  const occupied = new Set(directories);
  if (directorySet.size !== directories.length) fail('INVALID_TEMPLATE', 'Duplicate output directories.');
  const assertParent = relative => {
    const parent = path.posix.dirname(relative);
    if (parent !== '.' && !directorySet.has(parent)) fail('INVALID_TEMPLATE', `Undeclared output parent: ${parent}`);
  };
  for (const directory of directories) assertParent(directory);
  const files = [];
  for (const entry of layout.files) {
    if (!entry || typeof entry !== 'object') fail('INVALID_TEMPLATE', 'Each file entry needs path and template.');
    const output = relativePath(renderTokens(String(entry.path ?? ''), tokens, 'output path'), 'Output file');
    if (!TEXT_EXTENSIONS.has(path.posix.extname(output))) fail('INVALID_TEMPLATE', `Only text/JSON scaffolds may be created: ${output}`);
    if (occupied.has(output)) fail('INVALID_TEMPLATE', `Duplicate or conflicting output path: ${output}`);
    assertParent(output);
    const source = relativePath(entry.template, 'Template source');
    const content = renderTokens(await readSafeTemplate(templateRoot, source), tokens, source);
    if (path.posix.extname(output) === '.json') {
      try { JSON.parse(content); }
      catch { fail('INVALID_TEMPLATE', `Rendered JSON is invalid: ${output}`); }
    }
    files.push({path: output, content});
    occupied.add(output);
  }
  return {directories: directories.sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b)), files};
}

/** projectRoot is injectable only for isolated tests; the CLI always uses its own project root. */
export async function initializeEpisode({slug, projectRoot = PROJECT_ROOT, createdAt = new Date().toISOString()} = {}) {
  if (typeof slug !== 'string' || slug.length > 80 || !SLUG_PATTERN.test(slug)) {
    fail('INVALID_SLUG', 'Slug must be 1–80 lowercase ASCII letters/digits joined by single hyphens (no .mp4 or paths).');
  }
  if (typeof createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(createdAt) || !Number.isFinite(Date.parse(createdAt))) {
    fail('INVALID_DATE', 'createdAt must be an ISO UTC timestamp.');
  }
  const root = await fs.realpath(projectRoot);
  await assertDirectory(root, 'Project root');
  const base = path.join(root, 'videolar');
  const existingBase = await lstatOrNull(base);
  if (existingBase && (existingBase.isSymbolicLink() || !existingBase.isDirectory())) {
    fail('UNSAFE_PATH', 'videolar must be a real project directory, not a file or symlink.');
  }
  const target = path.join(base, slug);
  if (existingBase && await lstatOrNull(target)) fail('ALREADY_EXISTS', `Episode already exists: ${target}. Choose a new versioned slug; nothing was overwritten.`);
  const plan = await loadPlan(root, {slug, created_at: createdAt});

  // Validation and template reads finish before the first write.
  try { await fs.mkdir(base); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  await assertDirectory(base, 'videolar');
  if (await fs.realpath(base) !== base) fail('UNSAFE_PATH', 'videolar resolves outside its expected project path.');
  try { await fs.mkdir(target); }
  catch (error) {
    if (error.code === 'EEXIST') fail('ALREADY_EXISTS', `Episode already exists: ${target}. Choose a new versioned slug; nothing was overwritten.`);
    throw error;
  }
  try {
    for (const directory of plan.directories) await fs.mkdir(path.join(target, directory));
    for (const file of plan.files) await fs.writeFile(path.join(target, file.path), file.content, {flag: 'wx'});
  } catch (error) {
    // Keep a partially created scaffold for inspection; never delete or overwrite a competing writer's files.
    fail('INCOMPLETE_SCAFFOLD', `Scaffold creation stopped at ${target}; inspect it and use a new slug. ${error.message}`);
  }
  return {slug, directory: target, status: 'SCAFFOLDED', directories: plan.directories.length, files: plan.files.length, mediaGenerated: false};
}

const HELP = `BAY REFEREE production scaffold\n\nUsage:\n  node scripts/bay-referee-new-episode.mjs <slug>\n  node scripts/bay-referee-new-episode.mjs --help\n\nExample:\n  node scripts/bay-referee-new-episode.mjs production-smoke-test\n\nCreates videolar/<slug>/ from the production template. No topic/script input is\nrequired at initialization. Existing paths are never overwritten; choose a new\nversioned slug. No voice, video, cover, SRT, alignment or network job is generated.\n`;

const entryPath = process.argv[1] ? await fs.realpath(process.argv[1]).catch(() => null) : null;
if (entryPath === SCRIPT_PATH) {
  const args = process.argv.slice(2);
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) process.stdout.write(HELP);
  else if (args.length !== 1 || args[0].startsWith('-')) {
    process.stderr.write(`Expected one episode slug; --force is not supported.\n${HELP}`);
    process.exitCode = 2;
  } else {
    try {
      const result = await initializeEpisode({slug: args[0]});
      process.stdout.write(`BAY REFEREE scaffold ready: ${result.directory}\n${result.directories} directories, ${result.files} text/JSON files. No media generated.\n`);
    } catch (error) {
      process.stderr.write(`${error.code ?? 'ERROR'}: ${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
