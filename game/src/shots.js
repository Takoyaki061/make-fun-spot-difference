// The screenshot scenes behind ?shot=start|play|play2|end (with &level=N).
// Each one stages a real game state — a title, a mid-hunt frame with some
// differences already found, or a cleared room — paints it twice and sets
// window.__shotReady, so a screenshot is exactly what a player sees.
// No autopilot: the staged state is set directly on the real game object.

import { SCREEN_CLEAR, SCREEN_PLAY, SCREEN_TITLE } from './game.js';
import { LEVELS } from './config.js';
import { DIFFERENCES } from './differences.js';

/**
 * Stage `name` on `game` (start, play, play2 or end) and return the screen
 * the renderer should draw. `level` picks the room (1-based, default 1);
 * `found` picks how many differences are already found in a play scene.
 */
export function stageShot(name, game, level, found) {
  const state = game.state;
  const levelIndex = Math.min(Math.max((level ?? 1) - 1, 0), LEVELS.length - 1);
  const diffs = DIFFERENCES[levelIndex];
  if (name === 'play' || name === 'play2') {
    game.startLevel(levelIndex);
    // Play a few finds for real, through the game's own click path, so the
    // markers, the counter and the score are exactly what play produces.
    const take = found ?? (name === 'play' ? 2 : 3);
    const toFind = diffs.slice(0, take);
    for (const diff of toFind) {
      // Click the right panel, at the difference's own spot.
      game.click(680 + diff.x, 118 + diff.y);
    }
    // Spend some of the clock so the timer bar shows real pressure.
    state.timeLeft = name === 'play' ? LEVELS[levelIndex].seconds * 0.72 : LEVELS[levelIndex].seconds * 0.45;
    state.screen = SCREEN_PLAY;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'end') {
    game.startLevel(levelIndex);
    for (const diff of diffs) game.click(680 + diff.x, 118 + diff.y);
    state.screen = SCREEN_CLEAR;
    return { screen: SCREEN_CLEAR };
  }
  // start (and anything else): the title over the first room, untouched.
  game.startLevel(0);
  state.screen = SCREEN_TITLE;
  state.timeLeft = LEVELS[0].seconds;
  return { screen: SCREEN_TITLE };
}
