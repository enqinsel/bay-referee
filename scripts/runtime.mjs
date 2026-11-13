import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve, relative, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, copyFileSync, symlinkSync, lstatSync, readlinkSync, unlinkSync } from 'node:fs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

export function prepare() {
  const bin = join(root, '.tools', 'bin');
  mkdirSync(bin, { recursive: true });
  for (const [name, pkg] of [['ffmpeg', '@ffmpeg-installer/ffmpeg'], ['ffprobe', '@ffprobe-installer/ffprobe']]) {
    const target = relative(bin, require(pkg).path);
    const link = join(bin, name);
    const entry = lstatSync(link, { throwIfNoEntry: false });
    if (entry && !entry.isSymbolicLink()) {
      throw new Error(`Refusing to overwrite a non-symlink at ${link}.`);
    }
    if (entry && readlinkSync(link) !== target) unlinkSync(link);
    if (!entry || readlinkSyncSafe(link) !== target) {
      symlinkSync(target, link);
    }
  }
  const vendor = join(root, 'engine', 'composition', 'smoke', 'vendor');
  mkdirSync(vendor, { recursive: true });
  copyFileSync(require.resolve('gsap/dist/gsap.min.js'), join(vendor, 'gsap.min.js'));
  return {
    ...process.env,
    PATH: `${bin}${delimiter}${process.env.PATH || ''}`,
    HYPERFRAMES_NO_TELEMETRY: '1',
    HYPERFRAMES_NO_UPDATE_CHECK: '1',
    HYPERFRAMES_SKIP_SKILLS: '1',
    DO_NOT_TRACK: '1',
    NUMBA_CACHE_DIR: join(root, '.cache', 'numba'),
    MPLCONFIGDIR: join(root, '.cache', 'matplotlib'),
  };
}

function readlinkSyncSafe(path) {
  try { return readlinkSync(path); } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export function runHeavy(label, command, args, options = {}) {
  // One OS-wide lease shared with Python, custom renderers and direct FFmpeg.
  // Do not parallelize heavyweight child stages inside this lease.
  return run('python3', [join(root, 'scripts', 'heavy-job.py'), '--label', label, '--', command, ...args], options);
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, env: prepare(), stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
  return result;
}
