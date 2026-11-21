// The game itself: screens, timer, scoring, hints, streaks and particles.
// It knows nothing about drawing; the renderer reads this state each frame.

import { FIELD, HIT_RADIUS, HINTS_PER_LEVEL, LEVELS, PANEL, PANEL_LEFT, PANEL_RIGHT, SCORE } from './config.js';
import { DIFFERENCES, differencesOf } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

export function createGame(audio) {
  const state = {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    timeLeft: LEVELS[0].seconds,
    score: 0,
    streak: 0,
    bestStreak: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintPulse: null, // { id, until } — a ring throbbing around one difference
    hintText: '',
    particles: [], // { x, y, vx, vy, life, color, size }
    rings: [], // { x, y, life } — the expanding ring on a find
    misses: [], // { x, y, life } — red X marks where a click missed
    shake: 0,
    flash: 0, // white flash on a find, 0..1
    totalFound: 0,
    totalDiffs: DIFFERENCES.reduce((sum, list) => sum + list.length, 0),
    best: 0,
    muted: false,
    lastTickSecond: -1,
    message: '',
    messageUntil: 0,
    now: 0,
  };

  function levelDiffs() {
    return DIFFERENCES[state.levelIndex];
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.found = new Set();
    state.timeLeft = LEVELS[index].seconds;
    state.streak = 0;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hintPulse = null;
    state.hintText = '';
    state.particles = [];
    state.rings = [];
    state.misses = [];
    state.screen = SCREEN_PLAY;
    state.lastTickSecond = -1;
    state.message = `Level ${index + 1}: ${LEVELS[index].name} — find ${LEVELS[index].diffs}`;
    state.messageUntil = state.now + 3;
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 160;
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0.6 + Math.random() * 0.4,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  }

  /** Which panel, if either, holds field point (x, y)? Returns 0, 1 or -1. */
  function panelAt(x, y) {
    if (y >= PANEL.y && y < PANEL.y + PANEL.height) {
      if (x >= PANEL_LEFT.x && x < PANEL_LEFT.x + PANEL.width) return 0;
      if (x >= PANEL_RIGHT.x && x < PANEL_RIGHT.x + PANEL.width) return 1;
    }
    return -1;
  }

  function toPanel(panel, x, y) {
    const origin = panel === 0 ? PANEL_LEFT : PANEL_RIGHT;
    return { x: x - origin.x, y: y - origin.y };
  }

  function click(x, y) {
    if (state.screen !== SCREEN_PLAY) return;
    audio.unlock();
    const panel = panelAt(x, y);
    if (panel === -1) return;
    const point = toPanel(panel, x, y);
    const diffs = levelDiffs();
    for (const diff of diffs) {
      if (state.found.has(diff.id)) continue;
      const dx = point.x - diff.x;
      const dy = point.y - diff.y;
      if (dx * dx + dy * dy <= (diff.r + 12) * (diff.r + 12)) {
        state.found.add(diff.id);
        state.totalFound += 1;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        const gained = SCORE.find + SCORE.streak * (state.streak - 1);
        state.score += gained;
        state.rings.push({ x, y, life: 0.6 });
        state.flash = 0.5;
        burst(x, y, '#ffd28a', 18);
        burst(x, y, '#7ddb8a', 10);
        audio.find(state.streak);
        if (state.found.size === diffs.length) {
          const bonus = Math.ceil(state.timeLeft) * SCORE.clearPerSecond;
          state.score += bonus;
          state.screen = SCREEN_CLEAR;
          state.message = `All ${diffs.length} found! Time bonus +${bonus}.`;
          state.messageUntil = state.now + 4;
          audio.levelClear();
        }
        return;
      }
    }
    // A miss: a red X, a thud, the streak breaks and a few points go.
    state.streak = 0;
    state.score = Math.max(0, state.score - SCORE.miss);
    state.misses.push({ x, y, life: 0.9 });
    state.shake = 0.35;
    burst(x, y, '#ff6b6b', 8);
    audio.miss();
  }

  function useHint() {
    if (state.screen !== SCREEN_PLAY) return;
    if (state.hintsLeft <= 0) {
      state.hintText = 'No hints left — trust your eyes!';
      state.messageUntil = state.now + 2;
      return;
    }
    const remaining = levelDiffs().filter((diff) => !state.found.has(diff.id));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintsLeft -= 1;
    state.hintPulse = { id: pick.id, until: state.now + 2.2 };
    state.hintText = pick.hint;
    state.messageUntil = state.now + 2.2;
    audio.hint();
  }

  function confirm() {
    if (state.screen === SCREEN_TITLE) {
      state.score = 0;
      state.totalFound = 0;
      state.bestStreak = 0;
      startLevel(0);
    } else if (state.screen === SCREEN_CLEAR) {
      if (state.levelIndex + 1 < LEVELS.length) startLevel(state.levelIndex + 1);
      else {
        state.screen = SCREEN_WIN;
        audio.gameWin();
      }
    } else if (state.screen === SCREEN_OVER || state.screen === SCREEN_WIN) {
      state.screen = SCREEN_TITLE;
    }
  }

  function update(dt) {
    state.now += dt;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt * 1.6);
    for (const particle of state.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 260 * dt;
      particle.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
    for (const ring of state.rings) ring.life -= dt;
    state.rings = state.rings.filter((r) => r.life > 0);
    for (const miss of state.misses) miss.life -= dt;
    state.misses = state.misses.filter((m) => m.life > 0);
    if (state.hintPulse && state.now > state.hintPulse.until) state.hintPulse = null;

    if (state.screen !== SCREEN_PLAY) return;
    state.timeLeft -= dt;
    // Timer pressure you can feel: a tick each second in the last ten.
    const whole = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10.5 && whole !== state.lastTickSecond && state.timeLeft > 0) {
      state.lastTickSecond = whole;
      audio.tick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_OVER;
      audio.gameOver();
    }
  }

  return {
    state,
    startLevel,
    click,
    useHint,
    confirm,
    update,
    panelAt,
    toPanel,
    differencesOf,
    levelDiffs,
    get foundCount() {
      return state.found.size;
    },
  };
}
