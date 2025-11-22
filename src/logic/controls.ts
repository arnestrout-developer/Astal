
// src/logic/controls.ts
// Handles keyboard and gamepad/controller input, updating control state variables

export const DEADZONE = 0.2; // Radial deadzone for analog input


export type ControlState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
  special: boolean;
  analogX: number; // -1 (left) to 1 (right)
  analogY: number; // -1 (up) to 1 (down)
};

type BooleanControlKey = 'up' | 'down' | 'left' | 'right' | 'fire' | 'special';

export const controlState: ControlState = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  special: false,
  analogX: 0,
  analogY: 0,
};

const keyMap: Record<string, BooleanControlKey> = {
  ArrowUp: 'up',
  w: 'up',
  ArrowDown: 'down',
  s: 'down',
  ArrowLeft: 'left',
  a: 'left',
  ArrowRight: 'right',
  d: 'right',
  ' ': 'fire',
  Enter: 'special',
};

window.addEventListener('keydown', (e) => {
  const key = keyMap[e.key];
  if (key && typeof controlState[key] === 'boolean') controlState[key] = true;
  // Set analog values for keyboard
  if (e.key === 'ArrowLeft' || e.key === 'a') controlState.analogX = -1;
  if (e.key === 'ArrowRight' || e.key === 'd') controlState.analogX = 1;
  if (e.key === 'ArrowUp' || e.key === 'w') controlState.analogY = -1;
  if (e.key === 'ArrowDown' || e.key === 's') controlState.analogY = 1;
});

window.addEventListener('keyup', (e) => {
  const key = keyMap[e.key];
  if (key && typeof controlState[key] === 'boolean') controlState[key] = false;
  // Reset analog values for keyboard
  if (
    e.key === 'ArrowLeft' || e.key === 'a' ||
    e.key === 'ArrowRight' || e.key === 'd'
  ) controlState.analogX = 0;
  if (
    e.key === 'ArrowUp' || e.key === 'w' ||
    e.key === 'ArrowDown' || e.key === 's'
  ) controlState.analogY = 0;
});

// Gamepad support


export function pollGamepads() {
  const gamepads = navigator.getGamepads();
  if (!gamepads) return;
  const gp = gamepads[0];
  if (!gp) return;
  // Analog axes
  let x = gp.axes[0] || 0;
  let y = gp.axes[1] || 0;
  // Radial deadzone
  const mag = Math.sqrt(x * x + y * y);
  if (mag < DEADZONE) {
    x = 0;
    y = 0;
  } else if (mag > 1) {
    x /= mag;
    y /= mag;
  }
  controlState.analogX = x;
  controlState.analogY = y;
  // Digital
  controlState.up = gp.buttons[12]?.pressed || y < -0.5;
  controlState.down = gp.buttons[13]?.pressed || y > 0.5;
  controlState.left = gp.buttons[14]?.pressed || x < -0.5;
  controlState.right = gp.buttons[15]?.pressed || x > 0.5;
  controlState.fire = gp.buttons[0]?.pressed || false;
  controlState.special = gp.buttons[1]?.pressed || false;
}

setInterval(pollGamepads, 16); // ~60Hz

// Pointer (mouse / touch) support
let activePointerId: number | null = null;
let pointerActive = false;

function updatePointerControls(clientX: number, clientY: number) {
  // Map pointer position relative to window center to analog values -1..1
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  // Normalize by the smaller half-dimension so input is symmetric
  const half = Math.min(cx, cy);
  let nx = (clientX - cx) / half;
  let ny = (clientY - cy) / half;
  // Clamp
  nx = Math.max(-1, Math.min(1, nx));
  ny = Math.max(-1, Math.min(1, ny));

  // Apply radial deadzone
  const mag = Math.sqrt(nx * nx + ny * ny);
  if (mag < DEADZONE) {
    controlState.analogX = 0;
    controlState.analogY = 0;
  } else {
    // Keep magnitude but clamp to 1
    const inv = 1 / Math.max(1, mag);
    controlState.analogX = nx * inv * Math.min(mag, 1);
    controlState.analogY = ny * inv * Math.min(mag, 1);
  }

  // Update digital booleans based on thresholds
  controlState.left = controlState.analogX < -0.4;
  controlState.right = controlState.analogX > 0.4;
  controlState.up = controlState.analogY < -0.4;
  controlState.down = controlState.analogY > 0.4;
}

window.addEventListener('pointerdown', (e) => {
  // capture primary pointer for movement and firing
  if (activePointerId === null) {
    activePointerId = e.pointerId;
    pointerActive = true;
    updatePointerControls(e.clientX, e.clientY);
    // treat pointer hold as firing
    controlState.fire = true;
    // capture to receive move/up even if pointer leaves element
    (e.target as Element | null)?.setPointerCapture?.(e.pointerId);
  }
});

window.addEventListener('pointermove', (e) => {
  if (!pointerActive) return;
  if (e.pointerId !== activePointerId) return;
  updatePointerControls(e.clientX, e.clientY);
});

window.addEventListener('pointerup', (e) => {
  if (e.pointerId !== activePointerId) return;
  // reset controls
  pointerActive = false;
  activePointerId = null;
  controlState.fire = false;
  controlState.analogX = 0;
  controlState.analogY = 0;
  controlState.left = false;
  controlState.right = false;
  controlState.up = false;
  controlState.down = false;
  (e.target as Element | null)?.releasePointerCapture?.(e.pointerId);
});

window.addEventListener('pointercancel', (e) => {
  if (e.pointerId !== activePointerId) return;
  pointerActive = false;
  activePointerId = null;
  controlState.fire = false;
  controlState.analogX = 0;
  controlState.analogY = 0;
  controlState.left = false;
  controlState.right = false;
  controlState.up = false;
  controlState.down = false;
});
