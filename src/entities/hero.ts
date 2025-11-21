
import { Sprite, Texture, Container } from 'pixi.js';
import { controlState } from '../logic/controls';

export class Hero extends Container {
  sprite: Sprite;
  private invincibleSeconds = 0; // seconds remaining of invincibility

  constructor(texture: Texture) {
    super();
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    // Scale sprite to 128px width, maintaining aspect ratio
    const targetWidth = 128;
    const scale = targetWidth / this.sprite.texture.width;
    this.sprite.scale.set(scale);
    this.sprite.x = 1920/2;
    this.sprite.y = 1080/5*4;
    this.addChild(this.sprite);
  }

  // Add update logic here if needed
  update(delta: number) {
    // Movement speed in pixels per frame at 60fps
    const speed = 8 * delta;
    let dx = 0, dy = 0;
    // Use analog if present, otherwise digital
    if (controlState.analogX !== 0 || controlState.analogY !== 0) {
      dx = controlState.analogX * speed;
      dy = controlState.analogY * speed;
    } else {
      if (controlState.left) dx -= speed;
      if (controlState.right) dx += speed;
      if (controlState.up) dy -= speed;
      if (controlState.down) dy += speed;
    }

    this.sprite.x += dx;
    this.sprite.y += dy;

    // Clamp to 1920x1080 bounds
    const halfW = (this.sprite.width) / 2;
    const halfH = (this.sprite.height) / 2;
    this.sprite.x = Math.max(halfW, Math.min(1920 - halfW, this.sprite.x));
    this.sprite.y = Math.max(halfH, Math.min(1080 - halfH, this.sprite.y));

    // Invincibility timer (delta is ticker.deltaTime; convert to seconds)
    if (this.invincibleSeconds > 0) {
      // delta is the ticker.deltaTime (dimensionless ~1 at 60fps)
      // convert to seconds: deltaSeconds = delta / 60
      const deltaSeconds = delta / 60;
      this.invincibleSeconds = Math.max(0, this.invincibleSeconds - deltaSeconds);
      // blink at ~5Hz while invincible
      const blink = Math.floor(this.invincibleSeconds * 5) % 2 === 0;
      this.sprite.alpha = blink ? 0.5 : 1.0;
    } else {
      this.sprite.alpha = 1.0;
    }
  }

  startInvincible(seconds: number) {
    this.invincibleSeconds = Math.max(0, seconds);
  }

  get isInvincible() {
    return this.invincibleSeconds > 0;
  }

  reset(x = 1920 / 2, y = (1080 / 5) * 4) {
    this.sprite.x = x;
    this.sprite.y = y;
    this.invincibleSeconds = 0;
    this.sprite.alpha = 1.0;
  }
}
