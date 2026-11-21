// Nearly the Same — a spot-the-difference hunt. The game is this directory's
// game/ folder, plain static files a desktop browser loads offline
// (game/index.html and its ES modules, no library and no network request),
// and the program hands it in: it copies game/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Pre-flight: refuse to hand in a half-built entry instead of letting the
// dossier library fail deep inside the copy. The game must open, and the
// screenshots must be real renders of it (3 or 4, each under the cap).
if (!existsSync(join(here, 'game', 'index.html'))) {
  throw new Error('main.ts: game/index.html is missing — the game is not built yet');
}
const shotDir = join(here, 'screenshots');
if (!existsSync(shotDir)) throw new Error('main.ts: screenshots/ is missing — take the screenshots first');
const shots = readdirSync(shotDir).filter((name) => !name.startsWith('.'));
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`main.ts: screenshots/ holds ${shots.length} images, the gate wants 3 or 4`);
}
for (const name of shots) {
  const size = statSync(join(shotDir, name)).size;
  if (size > 262144) throw new Error(`main.ts: screenshots/${name} is ${size} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

const dossierBytes = statSync(join(out, 'dossier.json')).size;
console.log(`handed in: game/ + ${shots.length} screenshots (${shots.join(', ')}) + dossier.json (${dossierBytes} bytes) -> ${out}`);
