import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root, run } from './runtime.mjs';
const python = join(root, '.venv', 'bin', 'python');
if (!existsSync(python)) {
  console.error('Missing .venv. Follow README installation first.');
  process.exitCode = 1;
} else {
  run(python, process.argv.slice(2));
}
