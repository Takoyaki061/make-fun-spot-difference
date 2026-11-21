// All sound is synthesized with WebAudio — no audio files, no network.
// A streak of finds climbs a little scale, so a hot streak sounds like one.

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  /** A short sine blip that slides from `from` Hz to `to` Hz over `seconds`. */
  function blip(from, to, seconds, volume, delay = 0) {
    if (muted) return;
    const audio = ensure();
    if (!audio) return;
    const start = audio.currentTime + delay;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + seconds);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.02);
  }

  /** A soft thud for a wrong click: a low triangle wave that falls fast. */
  function thud() {
    if (muted) return;
    const audio = ensure();
    if (!audio) return;
    const start = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(160, start);
    oscillator.frequency.exponentialRampToValueAtTime(70, start + 0.16);
    gain.gain.setValueAtTime(0.16, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.2);
  }

  const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319];

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    /** A find: a bright blip that steps up the scale with the streak. */
    find(streak) {
      const note = SCALE[Math.min(streak, SCALE.length - 1)];
      blip(note, note * 1.5, 0.16, 0.18);
      blip(note * 2, note * 2, 0.1, 0.06, 0.05);
    },
    miss() {
      thud();
    },
    hint() {
      blip(880, 1320, 0.2, 0.1);
    },
    levelClear() {
      [523, 659, 784, 1047].forEach((note, i) => blip(note, note, 0.18, 0.14, i * 0.09));
    },
    gameWin() {
      [523, 659, 784, 1047, 1319, 1568].forEach((note, i) => blip(note, note, 0.22, 0.14, i * 0.1));
    },
    gameOver() {
      blip(392, 196, 0.5, 0.14);
    },
    tick() {
      blip(1200, 1200, 0.05, 0.05);
    },
  };
}
