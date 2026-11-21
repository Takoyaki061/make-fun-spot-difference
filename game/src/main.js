// Boot and the one loop: input is read every frame, the world advances in
// real time, and the renderer paints what is there. The game moves between
// six screens: title, play, paused, level-clear, game over and win.
//
// ?seed=N is accepted and ignored (the scenes are fixed); ?shot=start|play|
// play2|end (with &level=N) stages that scene instead of running the loop,
// paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY, LEVELS } from './config.js';
import { createAudio } from './audio.js';
import { createGame, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './game.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, ACTION_RESTART, createInput } from './input.js';
import { createRenderer, HINT_BUTTON } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const levelParam = Number.parseInt(params.get('level') ?? '', 10);
const level = Number.isInteger(levelParam) ? levelParam : 1;
const foundParam = Number.parseInt(params.get('found') ?? '', 10);
const found = Number.isInteger(foundParam) ? foundParam : undefined;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const audio = createAudio();
const game = createGame(audio);
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

game.state.best = readBest();

function announce(message) {
  status.textContent = message;
}

function onAction(action) {
  audio.unlock();
  const state = game.state;
  if (action === ACTION_MUTE) {
    state.muted = audio.toggleMute();
    announce(state.muted ? 'Sound off.' : 'Sound on.');
    return;
  }
  if (action === ACTION_RESTART) {
    if (state.screen === SCREEN_PLAY || state.screen === SCREEN_PAUSED) {
      game.startLevel(state.levelIndex);
      announce(`Level ${state.levelIndex + 1} restarted.`);
    }
    return;
  }
  if (action === ACTION_PAUSE) {
    if (state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (state.screen === SCREEN_PAUSED) {
      state.screen = SCREEN_PLAY;
      announce('Playing.');
    }
    return;
  }
  if (action === ACTION_HINT) {
    game.useHint();
    return;
  }
  if (action === ACTION_CONFIRM) {
    const before = state.screen;
    if (before === 'over' || before === 'win') {
      if (state.score > state.best) {
        state.best = state.score;
        saveBest(state.best);
      }
    }
    game.confirm();
    if (state.screen === SCREEN_PLAY && before === SCREEN_TITLE) {
      announce('Playing. Find every difference before time runs out.');
    }
  }
}

function onClick(point) {
  audio.unlock();
  const state = game.state;
  // The hint button lives in the header; it is a real button.
  if (
    state.screen === SCREEN_PLAY &&
    point.x >= HINT_BUTTON.x && point.x <= HINT_BUTTON.x + HINT_BUTTON.w &&
    point.y >= HINT_BUTTON.y && point.y <= HINT_BUTTON.y + HINT_BUTTON.h
  ) {
    game.useHint();
    return;
  }
  if (state.screen === SCREEN_TITLE || state.screen === 'clear' || state.screen === 'over' || state.screen === 'win') {
    onAction(ACTION_CONFIRM);
    return;
  }
  if (state.screen === SCREEN_PAUSED) {
    state.screen = SCREEN_PLAY;
    return;
  }
  const before = state.found.size;
  game.click(point.x, point.y);
  const after = state.found.size;
  if (after > before) {
    announce(`Found ${after} of ${LEVELS[state.levelIndex].diffs} — keep looking.`);
  }
  if (state.screen === 'clear' || state.screen === 'over') {
    if (state.score > state.best) {
      state.best = state.score;
      saveBest(state.best);
    }
  }
}

createInput(canvas, { onClick, onAction });

// A handle for automated testing (and for curious players in the console).
window.__game = game;

function runShot(name) {
  stageShot(name, game, level, found);
  let painted = 0;
  function paint() {
    renderer.draw(game.state);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    game.update(dt);
    const state = game.state;
    if ((state.screen === 'clear' || state.screen === 'over' || state.screen === 'win') && state.score > state.best) {
      state.best = state.score;
      saveBest(state.best);
    }
    renderer.draw(state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
