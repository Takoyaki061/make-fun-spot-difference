// Where every difference lives, in each panel's local 560x440 space.
// The left picture is the original; the right picture changes exactly one
// thing per entry here. `hint` is the short clue the hint button whispers.
//
// Level 1 — Rainy Bakery (5 differences, the gentle ones).
// Level 2 — Overgrown Balcony (7 differences, smaller and busier).
// Level 3 — Snowed-In Cabin (8 differences, the sneaky ones).

export const DIFFERENCES = [
  [
    { id: 'cat-tail', x: 368, y: 256, r: 20, hint: 'The sleeping cat looks shorter than it should.' },
    { id: 'croissant', x: 150, y: 332, r: 24, hint: 'Something tasty vanished from the counter.' },
    { id: 'lamp-glow', x: 280, y: 78, r: 20, hint: 'The hanging lamp is not the same colour.' },
    { id: 'cookie', x: 470, y: 68, r: 20, hint: 'Count the cookies in the jar on the shelf.' },
    { id: 'raindrop', x: 300, y: 60, r: 16, hint: 'One rain streak is missing from the window.' },
  ],
  [
    { id: 'snail', x: 285, y: 318, r: 16, hint: 'Something tiny rides the watering can.' },
    { id: 'dark-bulb', x: 280, y: 60, r: 16, hint: 'One bulb in the string has gone out.' },
    { id: 'paperback', x: 130, y: 310, r: 20, hint: 'The chair lost its reading.' },
    { id: 'bird', x: 92, y: 288, r: 18, hint: 'A visitor on the railing flew away.' },
    { id: 'sheet-pin', x: 488, y: 88, r: 14, hint: 'Look at how the sheet hangs on the line.' },
    { id: 'sunflower', x: 488, y: 296, r: 20, hint: 'The sunflower is facing the other way.' },
    { id: 'pot-color', x: 180, y: 360, r: 22, hint: 'One pot is not terracotta any more.' },
  ],
  [
    { id: 'marshmallow', x: 130, y: 303, r: 16, hint: 'Count the marshmallows in the cocoa.' },
    { id: 'dog-tail', x: 372, y: 372, r: 20, hint: 'The sleeping dog lost something waggy.' },
    { id: 'sock', x: 393, y: 185, r: 18, hint: 'A sock is missing from the drying rail.' },
    { id: 'honey-dipper', x: 244, y: 290, r: 18, hint: 'The honey bear lost its dipper.' },
    { id: 'steam', x: 362, y: 185, r: 18, hint: 'The kettle steam curls the wrong way.' },
    { id: 'shelf-jar', x: 477, y: 111, r: 16, hint: 'A jar vanished from the top shelf.' },
    { id: 'frost-star', x: 200, y: 70, r: 16, hint: 'A frost star is missing from the window.' },
    { id: 'rug-stripe', x: 280, y: 415, r: 18, hint: 'One stripe of the rug changed colour.' },
  ],
];

/** The differences of one level, as a map from id to its spot. */
export function differencesOf(levelIndex) {
  const map = new Map();
  for (const diff of DIFFERENCES[levelIndex]) map.set(diff.id, diff);
  return map;
}
