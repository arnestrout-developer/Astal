
import { Sprite, Texture, Container } from 'pixi.js';
import { controlState } from '../logic/controls';

export class Hero extends Container {
  sprite: Sprite;

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
  }
}
