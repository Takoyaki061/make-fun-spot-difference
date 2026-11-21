# Nearly the Same — a spot-the-difference hunt

Two near-identical pictures side by side. A few quiet lies between them.
Click every difference — in either picture — before the clock runs out.

Three original rooms, drawn procedurally on canvas (no image files):

1. **Rainy Bakery** — a bakery window at closing time, 5 differences, 2:00.
2. **Overgrown Balcony** — a balcony at golden hour, 7 differences, 2:30.
3. **Snowed-In Cabin** — a cabin kitchen at midnight, 8 differences, 2:30.

A find earns points and climbs a little scale of chimes; a streak pays
extra. A wrong click costs points and breaks the streak. Hints (H, or the
button) pulse a ring around one difference you have not found yet — three
per room. The timer bar slides from cool to hot as it runs out, and ticks
in the last ten seconds. Clearing a room pays a time bonus.

## How to run

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network requests:
`game/index.html` and its ES modules under `game/src/` are the whole game.

Keyboard: **H** hint, **M** sound, **P** pause, **R** restart,
**Enter** start / next room. Mouse or touch: click a difference.

## Screenshots

`screenshots/` holds four renders of the game itself, staged with the
game's own `?shot=` scenes: the title, a mid-hunt frame in the bakery,
a harder hunt on the balcony, and a cleared cabin room.

## License

MIT — see LICENSE.
