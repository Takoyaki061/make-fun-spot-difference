// Everything the player sees: the header with its counter and timer bar,
// the two picture panels with their found markers, the footer tray, and
// the title, pause, clear, over and win screens. The judge reads the game
// mostly through screenshots, so the counter, the markers and the timer
// are drawn big and plain.

import { FIELD, FONT, LEVELS, PALETTE, PANEL, PANEL_LEFT, PANEL_RIGHT } from './config.js';
import { DIFFERENCES } from './differences.js';
import { drawScene } from './scenes.js';
import { SCREEN_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './game.js';

export const HINT_BUTTON = { x: 1060, y: 54, w: 180, h: 34 };

function timerColor(fraction) {
  if (fraction > 0.5) return PALETTE.timerCool;
  if (fraction > 0.2) return PALETTE.timerWarm;
  return PALETTE.timerHot;
}

function drawPanelFrame(ctx, origin) {
  ctx.fillStyle = PALETTE.panelFrame;
  ctx.fillRect(origin.x - 6, PANEL.y - 6, PANEL.width + 12, PANEL.height + 12);
  ctx.fillStyle = '#0e0b16';
  ctx.fillRect(origin.x, PANEL.y, PANEL.width, PANEL.height);
}

/** The small tag in a panel's top corner, drawn after the scene so it sits on top. */
function drawPanelTag(ctx, origin, tag, tagColor) {
  ctx.fillStyle = 'rgba(14, 11, 22, 0.65)';
  ctx.fillRect(origin.x, PANEL.y, 170, 26);
  ctx.fillStyle = tagColor;
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(tag, origin.x + 10, PANEL.y + 18);
}

function drawFoundMarker(ctx, origin, diff, pulse) {
  const x = origin.x + diff.x;
  const y = PANEL.y + diff.y;
  const r = diff.r + 8 + (pulse ? Math.sin(pulse * 6) * 2 : 0);
  ctx.strokeStyle = PALETTE.good;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(125, 219, 138, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r + 5, 0, Math.PI * 2);
  ctx.stroke();
  // The check mark inside.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x - 2, y + 6);
  ctx.lineTo(x + 9, y - 7);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

function drawHintRing(ctx, origin, diff, now) {
  const x = origin.x + diff.x;
  const y = PANEL.y + diff.y;
  const throb = 0.5 + 0.5 * Math.sin(now * 5);
  ctx.strokeStyle = `rgba(142, 203, 255, ${0.55 + 0.4 * throb})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, diff.r + 10 + throb * 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = PALETTE.hint;
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('?', x, y - diff.r - 14);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;

  function drawHeader(state) {
    ctx.fillStyle = PALETTE.header;
    ctx.fillRect(0, 0, FIELD.width, 96);
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 30px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('NEARLY THE SAME', 40, 38);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `15px ${FONT}`;
    ctx.fillText('a spot-the-difference hunt · 3 quiet rooms', 40, 64);

    // The counter: how many remain is the heart of the game.
    const level = LEVELS[state.levelIndex];
    const found = state.found.size;
    const total = level.diffs;
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 34px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`${found} / ${total} FOUND`, 640, 42);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `15px ${FONT}`;
    ctx.fillText(`LEVEL ${state.levelIndex + 1} · ${level.name.toUpperCase()} · ${total - found} STILL HIDING`, 640, 66);

    // Score, top right.
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 22px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE ${state.score}`, 1240, 34);
    // Hint button.
    const hover = state.hintsLeft > 0;
    ctx.fillStyle = hover ? '#2c4a6b' : '#33303a';
    ctx.beginPath();
    ctx.roundRect(HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.w, HINT_BUTTON.h, 8);
    ctx.fill();
    ctx.strokeStyle = PALETTE.hint;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = hover ? PALETTE.hint : PALETTE.muted;
    ctx.font = `bold 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`HINT (H) · ${state.hintsLeft} LEFT`, HINT_BUTTON.x + HINT_BUTTON.w / 2, HINT_BUTTON.y + 22);

    // Timer bar: cool to hot, pulsing when nearly out.
    const fraction = Math.max(0, state.timeLeft / level.seconds);
    const barY = 96;
    ctx.fillStyle = '#241d33';
    ctx.fillRect(40, barY, 1200, 10);
    ctx.fillStyle = timerColor(fraction);
    ctx.fillRect(40, barY, 1200 * fraction, 10);
    if (fraction <= 0.2 && state.screen === SCREEN_PLAY) {
      ctx.fillStyle = `rgba(255, 107, 107, ${0.25 + 0.25 * Math.sin(state.now * 8)})`;
      ctx.fillRect(40, barY, 1200, 10);
    }
  }

  function drawPanels(state) {
    const changed = new Set(state.found);
    // Left panel: the original. Right panel: the changed picture.
    const origins = [PANEL_LEFT, PANEL_RIGHT];
    for (let panel = 0; panel < 2; panel += 1) {
      const origin = origins[panel];
      drawPanelFrame(ctx, origin);
      ctx.save();
      ctx.beginPath();
      ctx.rect(origin.x, PANEL.y, PANEL.width, PANEL.height);
      ctx.clip();
      ctx.translate(origin.x, PANEL.y);
      drawScene(ctx, state.levelIndex, panel, panel === 1 ? new Set(DIFFERENCES[state.levelIndex].map((d) => d.id)) : new Set());
      ctx.restore();
      drawPanelTag(ctx, origin, panel === 0 ? 'ORIGINAL' : 'SPOT THE CHANGES', panel === 0 ? PALETTE.muted : PALETTE.accent);
    }
    // Found markers on both panels, at the same spot in each.
    for (const diff of DIFFERENCES[state.levelIndex]) {
      if (!state.found.has(diff.id)) continue;
      drawFoundMarker(ctx, PANEL_LEFT, diff, 0);
      drawFoundMarker(ctx, PANEL_RIGHT, diff, 0);
    }
    // Hint pulse on both panels.
    if (state.hintPulse) {
      const diff = DIFFERENCES[state.levelIndex].find((d) => d.id === state.hintPulse.id);
      if (diff) {
        drawHintRing(ctx, PANEL_LEFT, diff, state.now);
        drawHintRing(ctx, PANEL_RIGHT, diff, state.now);
      }
    }
    // Expanding rings and miss marks, in field coordinates.
    for (const ring of state.rings) {
      const progress = 1 - ring.life / 0.6;
      ctx.strokeStyle = `rgba(255, 210, 138, ${1 - progress})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, 10 + progress * 46, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const miss of state.misses) {
      ctx.strokeStyle = `rgba(255, 107, 107, ${Math.min(1, miss.life)})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const s = 9;
      ctx.beginPath();
      ctx.moveTo(miss.x - s, miss.y - s);
      ctx.lineTo(miss.x + s, miss.y + s);
      ctx.moveTo(miss.x + s, miss.y - s);
      ctx.lineTo(miss.x - s, miss.y + s);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }
    // Particles.
    for (const particle of state.particles) {
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
    // White flash on a find.
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${state.flash * 0.25})`;
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    }
  }

  function drawFooter(state) {
    const level = LEVELS[state.levelIndex];
    ctx.fillStyle = PALETTE.header;
    ctx.fillRect(0, 580, FIELD.width, 140);
    // Found tray: one slot per difference; found ones fill green.
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `bold 14px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('FOUND', 40, 612);
    const diffs = DIFFERENCES[state.levelIndex];
    diffs.forEach((diff, i) => {
      const x = 120 + i * 34;
      const y = 606;
      ctx.fillStyle = state.found.has(diff.id) ? PALETTE.good : '#33303a';
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
      if (state.found.has(diff.id)) {
        ctx.strokeStyle = '#0e0b16';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x - 1, y + 4);
        ctx.lineTo(x + 5, y - 4);
        ctx.stroke();
      }
    });
    // Hint whisper, or the room's description.
    const hint = state.hintPulse ? state.hintText : `Level ${state.levelIndex + 1} of ${LEVELS.length} — ${level.place}. ${state.bestStreak > 1 ? `Best streak ${state.bestStreak}.` : 'Click a difference in either picture.'}`;
    ctx.fillStyle = state.hintPulse ? PALETTE.hint : PALETTE.muted;
    ctx.font = `15px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(hint, 40, 648);
    // Controls and best score.
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `14px ${FONT}`;
    ctx.fillText('Click a difference · H hint · M sound · P pause · R restart', 40, 690);
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 16px ${FONT}`;
    ctx.fillText(`BEST ${state.best}`, 1240, 648);
    if (state.message && state.now < state.messageUntil) {
      ctx.fillStyle = PALETTE.accentSoft;
      ctx.font = `bold 16px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(state.message, 640, 690);
    }
  }

  function drawOverlay(title, lines, accent) {
    ctx.fillStyle = 'rgba(14, 11, 22, 0.82)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = accent;
    ctx.font = `bold 52px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(title, 640, 300);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `20px ${FONT}`;
    lines.forEach((line, i) => ctx.fillText(line, 640, 350 + i * 34));
  }

  function draw(state) {
    ctx.save();
    if (state.shake > 0) {
      const mag = state.shake * 14;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(-20, -20, FIELD.width + 40, FIELD.height + 40);
    drawHeader(state);
    drawPanels(state);
    drawFooter(state);
    ctx.restore();

    if (state.screen === SCREEN_TITLE) {
      drawOverlay('NEARLY THE SAME', [
        'Two pictures. A few quiet lies between them.',
        'Click every difference — in either picture — before the clock runs out.',
        `3 rooms · ${state.totalDiffs} differences · hints are few, use them well`,
        '',
        'Press Enter or click anywhere to start',
      ], PALETTE.accent);
      if (state.best > 0) {
        ctx.fillStyle = PALETTE.muted;
        ctx.font = `16px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText(`Best score so far: ${state.best}`, 640, 560);
      }
    } else if (state.screen === SCREEN_PAUSED) {
      drawOverlay('PAUSED', ['Take a breath. The clock is waiting.', 'Press P or Enter to carry on.'], PALETTE.muted);
    } else if (state.screen === SCREEN_CLEAR) {
      const last = state.levelIndex === LEVELS.length - 1;
      drawOverlay(last ? 'ALL ROOMS CLEARED!' : 'ROOM CLEARED!', [
        `Score ${state.score} · best streak ${state.bestStreak}`,
        last ? 'Press Enter to see how you did.' : 'Press Enter for the next room.',
      ], PALETTE.good);
    } else if (state.screen === SCREEN_OVER) {
      drawOverlay("TIME'S UP", [
        `You found ${state.found.size} of ${LEVELS[state.levelIndex].diffs} in ${LEVELS[state.levelIndex].name}.`,
        `Score ${state.score} · best ${state.best}`,
        'Press Enter to try again.',
      ], PALETTE.bad);
    } else if (state.screen === SCREEN_WIN) {
      drawOverlay('YOU FOUND THEM ALL!', [
        `All ${state.totalDiffs} differences, three quiet rooms.`,
        `Final score ${state.score} · best streak ${state.bestStreak} · best ${state.best}`,
        'Press Enter to play again.',
      ], PALETTE.good);
    }
  }

  return { draw };
}
