// Every tuning number and colour in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule
// below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

// The two picture panels, in field coordinates. Each panel shows one scene
// in a 560x440 local space; differences are defined in that local space.
export const PANEL = { width: 560, height: 440, y: 118 };
export const PANEL_LEFT = { x: 40, y: PANEL.y };
export const PANEL_RIGHT = { x: 680, y: PANEL.y };

export const HEADER = { height: 96 };
export const FOOTER = { y: 580, height: 118 };

/** Seconds on the clock per level, and the levels in order. */
export const LEVELS = [
  { name: 'Rainy Bakery', place: 'a bakery window at closing time', seconds: 120, diffs: 5 },
  { name: 'Overgrown Balcony', place: 'a balcony at golden hour', seconds: 150, diffs: 7 },
  { name: 'Snowed-In Cabin', place: 'a cabin kitchen at midnight', seconds: 150, diffs: 8 },
];

/** Hints per level. A hint pulses a ring around one difference you have not found yet. */
export const HINTS_PER_LEVEL = 3;

/** Radius, in panel pixels, inside which a click counts as hitting a difference. */
export const HIT_RADIUS = 26;

/** Points for a find: base, plus a streak bonus, plus a time bonus on level clear. */
export const SCORE = { find: 100, streak: 25, miss: 10, clearPerSecond: 5 };

export const PALETTE = {
  backdrop: '#14101d',
  header: '#1d1729',
  panelFrame: '#3a2f52',
  panelGap: '#241d33',
  text: '#f5efe4',
  muted: '#b8aec9',
  accent: '#ffb347',
  accentSoft: '#ffd28a',
  good: '#7ddb8a',
  bad: '#ff6b6b',
  timerCool: '#7ddb8a',
  timerWarm: '#ffb347',
  timerHot: '#ff6b6b',
  hint: '#8ecbff',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'nearly-the-same.best';
