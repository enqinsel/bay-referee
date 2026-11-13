import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { root, runHeavy } from './runtime.mjs';
mkdirSync(join(root, 'renders/previews'), { recursive: true });
runHeavy('smoke-render', join(root, 'node_modules/.bin/hyperframes'), [
  'render', 'engine/composition/smoke', '--output', 'renders/previews/engine-smoke.mp4',
  '--fps', '30', '--format', 'mp4', '--quality', 'standard', '--workers', '1',
  '--strict-all', '--no-best-effort', '--no-browser-gpu',
]);
