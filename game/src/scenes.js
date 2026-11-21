// The three scenes, drawn procedurally on canvas — no image files, all
// original art. Each painter draws one scene in a 560x440 local space.
// `variant` 0 is the left picture (the original); variant 1 is the right
// picture, where every difference id in `changed` is applied. The same
// painter draws both panels, so the two pictures agree everywhere except
// the differences — exactly what a spot-the-difference game needs.

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// Level 1 — Rainy Bakery: a bakery window at closing time.
// ---------------------------------------------------------------------------
export function drawBakery(ctx, variant, changed) {
  const is = (id) => variant === 1 && changed.has(id);

  // Wall and floor.
  ctx.fillStyle = '#2b1d33';
  ctx.fillRect(0, 0, 560, 440);
  ctx.fillStyle = '#3a2b45';
  ctx.fillRect(0, 300, 560, 140);

  // The big window: rainy night outside, warm light inside.
  ctx.fillStyle = '#1a2438';
  ctx.fillRect(28, 18, 320, 250);
  ctx.fillStyle = '#22304a';
  ctx.fillRect(38, 28, 300, 230);
  // Moon and rooftops.
  ctx.fillStyle = '#f4e8c8';
  circle(ctx, 300, 62, 18);
  ctx.fill();
  ctx.fillStyle = '#141c2c';
  poly(ctx, [[38, 258], [110, 180], [180, 258]]);
  ctx.fill();
  poly(ctx, [[160, 258], [250, 165], [338, 258]]);
  ctx.fill();
  // Rain streaks on the glass (one streak is a difference).
  ctx.strokeStyle = 'rgba(180, 210, 240, 0.55)';
  ctx.lineWidth = 2;
  const streaks = [[70, 60, 46], [120, 40, 60], [170, 80, 40], [220, 50, 55], [260, 90, 42], [300, 60, 50], [90, 150, 48], [150, 130, 52], [210, 160, 44], [270, 140, 50], [320, 180, 40]];
  for (const [x, y, len] of streaks) {
    if (x === 300 && is('raindrop')) continue;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4, y + len);
    ctx.stroke();
  }
  // Window frame and sill.
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 10;
  ctx.strokeRect(28, 18, 320, 250);
  ctx.beginPath();
  ctx.moveTo(188, 18);
  ctx.lineTo(188, 268);
  ctx.moveTo(28, 143);
  ctx.lineTo(348, 143);
  ctx.stroke();
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(18, 268, 340, 14);

  // Hanging lamp, centre: its glow colour is a difference.
  ctx.strokeStyle = '#4a3a55';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(280, 0);
  ctx.lineTo(280, 62);
  ctx.stroke();
  ctx.fillStyle = is('lamp-glow') ? '#9fd8c9' : '#ffb347';
  circle(ctx, 280, 78, 16);
  ctx.fill();
  const glow = ctx.createRadialGradient(280, 78, 6, 280, 78, 60);
  glow.addColorStop(0, is('lamp-glow') ? 'rgba(159,216,201,0.5)' : 'rgba(255,179,71,0.5)');
  glow.addColorStop(1, 'rgba(255,179,71,0)');
  ctx.fillStyle = glow;
  circle(ctx, 280, 78, 60);
  ctx.fill();

  // Shelves on the right wall, with a cookie jar and bread.
  ctx.fillStyle = '#5d4128';
  ctx.fillRect(380, 90, 160, 12);
  ctx.fillRect(380, 170, 160, 12);
  // Cookie jar: one cookie fewer on the right.
  ctx.fillStyle = 'rgba(200, 220, 240, 0.75)';
  rr(ctx, 448, 46, 44, 44, 8);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  const cookies = is('cookie') ? 4 : 5;
  for (let i = 0; i < cookies; i += 1) {
    circle(ctx, 456 + (i % 3) * 12, 62 + Math.floor(i / 3) * 14, 5);
    ctx.fill();
  }
  ctx.fillStyle = '#c98f4e';
  rr(ctx, 446, 40, 48, 8, 4);
  ctx.fill();
  // Loaves on the lower shelf.
  ctx.fillStyle = '#c98f4e';
  ellipse(ctx, 410, 162, 26, 10);
  ctx.fill();
  ellipse(ctx, 480, 162, 26, 10);
  ctx.fill();
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(398, 158);
  ctx.lineTo(422, 158);
  ctx.moveTo(468, 158);
  ctx.lineTo(492, 158);
  ctx.stroke();

  // Counter across the bottom.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(0, 300, 560, 24);
  ctx.fillStyle = '#5d3d22';
  ctx.fillRect(0, 324, 560, 116);

  // Croissant on a paper doily (missing on the right).
  ctx.fillStyle = '#f5efe4';
  circle(ctx, 150, 332, 26);
  ctx.fill();
  if (!is('croissant')) {
    ctx.fillStyle = '#e8a34c';
    ellipse(ctx, 150, 332, 24, 11);
    ctx.fill();
    ctx.strokeStyle = '#b87a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(132, 328);
    ctx.quadraticCurveTo(150, 322, 168, 328);
    ctx.moveTo(136, 336);
    ctx.quadraticCurveTo(150, 330, 164, 336);
    ctx.stroke();
  }

  // "SOLD OUT" card, hand-lettered, leaning on the counter.
  ctx.save();
  ctx.translate(250, 330);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#f5efe4';
  rr(ctx, -42, -20, 84, 40, 4);
  ctx.fill();
  ctx.fillStyle = '#a33';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SOLD OUT', 0, 0);
  ctx.restore();

  // The till, with the tabby cat asleep on it (its tail is a difference).
  ctx.fillStyle = '#3f3a44';
  rr(ctx, 380, 282, 90, 42, 6);
  ctx.fill();
  ctx.fillStyle = '#d8d2c4';
  rr(ctx, 388, 288, 74, 18, 3);
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('12.50', 425, 301);
  // Cat: curled body, head, ears, stripes — and a tail, unless it is gone.
  ctx.fillStyle = '#c98f4e';
  ellipse(ctx, 405, 262, 34, 16);
  ctx.fill();
  circle(ctx, 434, 254, 13);
  ctx.fill();
  poly(ctx, [[426, 244], [430, 232], [436, 243]]);
  ctx.fill();
  poly(ctx, [[440, 243], [446, 232], [448, 244]]);
  ctx.fill();
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(392, 252);
  ctx.quadraticCurveTo(396, 262, 390, 270);
  ctx.moveTo(402, 250);
  ctx.quadraticCurveTo(406, 260, 400, 270);
  ctx.stroke();
  if (!is('cat-tail')) {
    ctx.strokeStyle = '#c98f4e';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(374, 266);
    ctx.quadraticCurveTo(356, 258, 360, 242);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
  // Closed eye and nose.
  ctx.strokeStyle = '#5d3d22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(438, 254, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Level 2 — Overgrown Balcony: a balcony at golden hour.
// ---------------------------------------------------------------------------
export function drawBalcony(ctx, variant, changed) {
  const is = (id) => variant === 1 && changed.has(id);

  // Sunset sky and distant rooftops.
  const sky = ctx.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, '#ff9a5c');
  sky.addColorStop(0.55, '#ffb347');
  sky.addColorStop(1, '#7a4a6b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 560, 440);
  ctx.fillStyle = '#f4e8c8';
  circle(ctx, 470, 80, 26);
  ctx.fill();
  ctx.fillStyle = '#5d3a52';
  poly(ctx, [[0, 300], [90, 240], [180, 300]]);
  ctx.fill();
  poly(ctx, [[150, 300], [260, 225], [370, 300]]);
  ctx.fill();
  poly(ctx, [[330, 300], [450, 235], [560, 300]]);
  ctx.fill();

  // String of bulbs across the top (one bulb is dark on the right).
  ctx.strokeStyle = '#3a2f52';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(280, 70, 560, 18);
  ctx.stroke();
  for (let i = 0; i < 7; i += 1) {
    const x = 40 + i * 80;
    const y = 18 + Math.sin((x / 560) * Math.PI) * 34;
    ctx.strokeStyle = '#3a2f52';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x, y + 4);
    ctx.stroke();
    const dark = i === 3 && is('dark-bulb');
    ctx.fillStyle = dark ? '#4a4450' : '#ffe9a8';
    circle(ctx, x, y + 12, 8);
    ctx.fill();
    if (!dark) {
      const g = ctx.createRadialGradient(x, y + 12, 2, x, y + 12, 22);
      g.addColorStop(0, 'rgba(255,233,168,0.55)');
      g.addColorStop(1, 'rgba(255,233,168,0)');
      ctx.fillStyle = g;
      circle(ctx, x, y + 12, 22);
      ctx.fill();
    }
  }

  // Clothesline with a swaying sheet (one clothespin is a difference).
  ctx.strokeStyle = '#e8e0d0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(330, 92);
  ctx.lineTo(540, 88);
  ctx.stroke();
  ctx.fillStyle = '#f2ede2';
  ctx.beginPath();
  ctx.moveTo(385, 92);
  ctx.quadraticCurveTo(440, 112, 500, 90);
  ctx.lineTo(500, 215);
  ctx.quadraticCurveTo(440, 228, 385, 215);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c9b8e8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(410, 130);
  ctx.lineTo(410, 200);
  ctx.moveTo(465, 128);
  ctx.lineTo(465, 202);
  ctx.stroke();
  ctx.fillStyle = '#8a6d3b';
  ctx.fillRect(392, 86, 6, 12);
  if (!is('sheet-pin')) ctx.fillRect(488, 86, 6, 12);

  // Railing across the scene.
  ctx.fillStyle = '#4a3a55';
  ctx.fillRect(0, 296, 560, 10);
  for (let x = 20; x < 560; x += 46) ctx.fillRect(x, 306, 8, 74);
  ctx.fillStyle = '#3a2f52';
  ctx.fillRect(0, 380, 560, 12);

  // A bird on the railing (gone on the right).
  if (!is('bird')) {
    ctx.fillStyle = '#5b7fa6';
    ellipse(ctx, 92, 288, 14, 10);
    ctx.fill();
    circle(ctx, 104, 278, 7);
    ctx.fill();
    poly(ctx, [[110, 278], [120, 281], [110, 284]]);
    ctx.fill();
    ctx.strokeStyle = '#5b7fa6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(86, 296);
    ctx.lineTo(82, 306);
    ctx.moveTo(96, 296);
    ctx.lineTo(98, 306);
    ctx.stroke();
  }

  // Folding chair with a forgotten paperback (missing on the right).
  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(100, 330);
  ctx.lineTo(160, 330);
  ctx.moveTo(104, 330);
  ctx.lineTo(96, 380);
  ctx.moveTo(156, 330);
  ctx.lineTo(164, 380);
  ctx.moveTo(100, 306);
  ctx.lineTo(96, 380);
  ctx.moveTo(160, 306);
  ctx.lineTo(164, 380);
  ctx.stroke();
  ctx.fillStyle = '#a8763e';
  ctx.fillRect(96, 326, 68, 8);
  if (!is('paperback')) {
    ctx.fillStyle = '#b8452f';
    rr(ctx, 118, 306, 34, 16, 3);
    ctx.fill();
    ctx.fillStyle = '#f5efe4';
    ctx.fillRect(124, 310, 22, 8);
  }

  // Watering can with a snail on its spout (gone on the right).
  ctx.fillStyle = '#5b8a6b';
  rr(ctx, 240, 318, 52, 40, 8);
  ctx.fill();
  ctx.strokeStyle = '#4a7a5a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(292, 330);
  ctx.lineTo(318, 318);
  ctx.stroke();
  ctx.fillStyle = '#4a7a5a';
  poly(ctx, [[316, 312], [330, 318], [316, 324]]);
  ctx.fill();
  ctx.strokeStyle = '#4a7a5a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(252, 318, 14, Math.PI, Math.PI * 1.9);
  ctx.stroke();
  if (!is('snail')) {
    ctx.fillStyle = '#d8a24a';
    circle(ctx, 285, 318, 6);
    ctx.fill();
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(285, 318, 3.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Terracotta pots with trailing ivy (one pot changed colour).
  const pots = [[180, 352], [340, 352]];
  for (let i = 0; i < pots.length; i += 1) {
    const [x, y] = pots[i];
    const blue = i === 0 && is('pot-color');
    ctx.fillStyle = blue ? '#5b7fa6' : '#b45a32';
    poly(ctx, [[x - 24, y], [x + 24, y], [x + 18, y + 34], [x - 18, y + 34]]);
    ctx.fill();
    ctx.fillStyle = blue ? '#4a6a8a' : '#96431f';
    ctx.fillRect(x - 28, y - 8, 56, 10);
    ctx.strokeStyle = '#4a7a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.quadraticCurveTo(x - 18, y - 40, x - 34, y - 26);
    ctx.moveTo(x + 6, y - 8);
    ctx.quadraticCurveTo(x + 22, y - 44, x + 36, y - 30);
    ctx.stroke();
    ctx.fillStyle = '#5b8a3a';
    ellipse(ctx, x - 34, y - 26, 10, 6);
    ctx.fill();
    ellipse(ctx, x + 36, y - 30, 10, 6);
    ctx.fill();
  }

  // Sunflower in its own pot (it faces the other way on the right).
  ctx.fillStyle = '#b45a32';
  poly(ctx, [[466, 352], [510, 352], [504, 386], [472, 386]]);
  ctx.fill();
  ctx.strokeStyle = '#4a7a3a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(488, 352);
  ctx.lineTo(488, 312);
  ctx.stroke();
  const face = is('sunflower') ? -1 : 1;
  const hx = 488 + 14 * face;
  ctx.fillStyle = '#f2c94c';
  for (let a = 0; a < 8; a += 1) {
    const ang = (a / 8) * Math.PI * 2;
    ellipse(ctx, hx + Math.cos(ang) * 16, 296 + Math.sin(ang) * 16, 9, 5);
    ctx.fill();
  }
  ctx.fillStyle = '#8a5a2b';
  circle(ctx, hx, 296, 11);
  ctx.fill();
  ctx.fillStyle = '#5b3a1a';
  circle(ctx, hx - 3, 294, 1.5);
  ctx.fill();
  circle(ctx, hx + 3, 294, 1.5);
  ctx.fill();
  circle(ctx, hx + 4, 299, 1.5);
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Level 3 — Snowed-In Cabin: a cabin kitchen at midnight.
// ---------------------------------------------------------------------------
export function drawCabin(ctx, variant, changed) {
  const is = (id) => variant === 1 && changed.has(id);

  // Walls, floor, moonlit window.
  ctx.fillStyle = '#2a2438';
  ctx.fillRect(0, 0, 560, 440);
  ctx.fillStyle = '#3a2f45';
  ctx.fillRect(0, 330, 560, 110);
  ctx.fillStyle = '#1c2738';
  ctx.fillRect(58, 28, 190, 180);
  ctx.fillStyle = '#2c3d5c';
  ctx.fillRect(68, 38, 170, 160);
  // Moon through the frost.
  ctx.fillStyle = '#f4e8c8';
  circle(ctx, 200, 80, 20);
  ctx.fill();
  // Frost stars on the glass (one is missing on the right).
  ctx.strokeStyle = 'rgba(220, 235, 250, 0.8)';
  ctx.lineWidth = 2;
  const frost = [[100, 70], [150, 55], [200, 70], [120, 130], [180, 140], [220, 120], [90, 170], [150, 180]];
  for (const [x, y] of frost) {
    if (x === 200 && y === 70 && is('frost-star')) continue;
    ctx.beginPath();
    for (let a = 0; a < 6; a += 1) {
      const ang = (a / 6) * Math.PI * 2;
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * 9, y + Math.sin(ang) * 9);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 10;
  ctx.strokeRect(58, 28, 190, 180);
  ctx.beginPath();
  ctx.moveTo(153, 28);
  ctx.lineTo(153, 208);
  ctx.moveTo(58, 118);
  ctx.lineTo(248, 118);
  ctx.stroke();
  // Snow piled on the sill.
  ctx.fillStyle = '#eef4fa';
  ellipse(ctx, 153, 208, 100, 12);
  ctx.fill();

  // Top shelf with jars (one jar is missing on the right).
  ctx.fillStyle = '#5d4128';
  ctx.fillRect(400, 130, 150, 12);
  const jars = [[420, 92], [462, 92], [504, 92]];
  for (let i = 0; i < jars.length; i += 1) {
    if (i === 1 && is('shelf-jar')) continue;
    const [x, y] = jars[i];
    ctx.fillStyle = 'rgba(200, 220, 240, 0.6)';
    rr(ctx, x, y, 30, 38, 6);
    ctx.fill();
    ctx.fillStyle = ['#c98f4e', '#8a6d3b', '#a33'][i];
    ctx.fillRect(x + 4, y + 14, 22, 20);
  }

  // Stove with a kettle: its steam curls the other way on the right.
  ctx.fillStyle = '#3f3a44';
  rr(ctx, 300, 250, 170, 130, 8);
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  circle(ctx, 340, 290, 26);
  ctx.fill();
  circle(ctx, 425, 290, 26);
  ctx.fill();
  ctx.fillStyle = '#5b5540';
  circle(ctx, 340, 290, 18);
  ctx.fill();
  circle(ctx, 425, 290, 18);
  ctx.fill();
  // Kettle on the left burner.
  ctx.fillStyle = '#7a7f8a';
  ellipse(ctx, 362, 236, 34, 22);
  ctx.fill();
  ctx.fillStyle = '#5b606b';
  rr(ctx, 352, 208, 20, 12, 4);
  ctx.fill();
  ctx.fillStyle = '#a33';
  circle(ctx, 362, 206, 5);
  ctx.fill();
  ctx.strokeStyle = '#5b606b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(330, 228);
  ctx.lineTo(312, 214);
  ctx.stroke();
  // Steam: a curly ribbon, mirrored on the right.
  ctx.strokeStyle = 'rgba(230, 240, 250, 0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const dir = is('steam') ? -1 : 1;
  ctx.moveTo(362, 200);
  ctx.bezierCurveTo(362 + 14 * dir, 188, 362 - 12 * dir, 176, 362 + 10 * dir, 164);
  ctx.bezierCurveTo(362 + 20 * dir, 154, 362 - 8 * dir, 146, 362 + 6 * dir, 138);
  ctx.stroke();

  // Wool socks drying on the rail (one is missing on the right).
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(310, 168);
  ctx.lineTo(460, 168);
  ctx.stroke();
  const socks = [[330, '#b8452f'], [380, '#5b7fa6'], [430, '#5b8a3a']];
  for (let i = 0; i < socks.length; i += 1) {
    if (i === 1 && is('sock')) continue;
    const [x, color] = socks[i];
    ctx.fillStyle = color;
    rr(ctx, x, 168, 26, 34, 6);
    ctx.fill();
    rr(ctx, x, 196, 34, 12, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(245, 239, 228, 0.85)';
    ctx.fillRect(x, 168, 26, 7);
  }

  // Counter with the honey bear and the cocoa mug.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(0, 330, 560, 20);
  // Honey bear jar with its dipper (gone on the right).
  ctx.fillStyle = '#e8a34c';
  ellipse(ctx, 222, 322, 20, 16);
  ctx.fill();
  circle(ctx, 222, 302, 12);
  ctx.fill();
  ctx.fillStyle = '#c98f4e';
  circle(ctx, 214, 292, 4);
  ctx.fill();
  circle(ctx, 230, 292, 4);
  ctx.fill();
  if (!is('honey-dipper')) {
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(236, 296);
    ctx.lineTo(252, 282);
    ctx.stroke();
    ctx.fillStyle = '#c98f4e';
    circle(ctx, 254, 280, 5);
    ctx.fill();
  }
  // Chipped enamel mug of cocoa (one marshmallow fewer on the right).
  ctx.fillStyle = '#3f6d8a';
  rr(ctx, 104, 306, 48, 36, 6);
  ctx.fill();
  ctx.strokeStyle = '#3f6d8a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(154, 324, 10, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.fillStyle = '#5b3a1a';
  ellipse(ctx, 128, 308, 20, 5);
  ctx.fill();
  ctx.fillStyle = '#f5efe4';
  const mallows = is('marshmallow') ? 2 : 3;
  const mpos = [[118, 304], [130, 302], [140, 305]];
  for (let i = 0; i < mallows; i += 1) {
    circle(ctx, mpos[i][0], mpos[i][1], 5);
    ctx.fill();
  }
  // The chip on the mug's rim.
  ctx.fillStyle = '#2a2438';
  ctx.beginPath();
  ctx.arc(110, 306, 4, 0, Math.PI * 2);
  ctx.fill();

  // Rug under the dog (one stripe changed colour on the right).
  ctx.fillStyle = '#8a4a3a';
  rr(ctx, 250, 396, 260, 34, 8);
  ctx.fill();
  ctx.fillStyle = is('rug-stripe') ? '#5b7fa6' : '#e8a34c';
  ctx.fillRect(280, 396, 18, 34);
  ctx.fillStyle = '#e8a34c';
  ctx.fillRect(340, 396, 18, 34);
  ctx.fillRect(430, 396, 18, 34);

  // Sleeping dog on the rug (its tail is a difference).
  ctx.fillStyle = '#a8763e';
  ellipse(ctx, 420, 380, 42, 16);
  ctx.fill();
  circle(ctx, 458, 372, 13);
  ctx.fill();
  poly(ctx, [[450, 362], [454, 350], [460, 361]]);
  ctx.fill();
  if (!is('dog-tail')) {
    ctx.strokeStyle = '#a8763e';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(382, 382);
    ctx.quadraticCurveTo(366, 374, 370, 360);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
  ctx.strokeStyle = '#5d3d22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(462, 372, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Dog's nose and a soft "Z" of sleep.
  ctx.fillStyle = '#2b2b2b';
  circle(ctx, 470, 370, 3);
  ctx.fill();
  ctx.fillStyle = '#b8aec9';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('z', 486, 352);
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText('z', 498, 340);
}

/** Draw level `levelIndex` (0, 1 or 2) into the 560x440 space at the current transform. */
export function drawScene(ctx, levelIndex, variant, changed) {
  if (levelIndex === 0) drawBakery(ctx, variant, changed);
  else if (levelIndex === 1) drawBalcony(ctx, variant, changed);
  else drawCabin(ctx, variant, changed);
}
