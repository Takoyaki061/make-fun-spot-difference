// Pointer and keyboard input, translated into field coordinates.
// Clicks land on one of the two panels; the game decides what they hit.
// Keyboard: H hint, M mute, Enter/Space confirm, R restart, P pause.

export const ACTION_CONFIRM = 'confirm';
export const ACTION_HINT = 'hint';
export const ACTION_MUTE = 'mute';
export const ACTION_RESTART = 'restart';
export const ACTION_PAUSE = 'pause';

export function createInput(canvas, handlers) {
  function toField(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function onPointerDown(event) {
    event.preventDefault();
    handlers.onClick(toField(event));
  }

  function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (key === 'h') handlers.onAction(ACTION_HINT);
    else if (key === 'm') handlers.onAction(ACTION_MUTE);
    else if (key === 'r') handlers.onAction(ACTION_RESTART);
    else if (key === 'p' || key === 'escape') handlers.onAction(ACTION_PAUSE);
    else if (key === 'enter' || key === ' ') {
      event.preventDefault();
      handlers.onAction(ACTION_CONFIRM);
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);

  return {
    destroy() {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}
