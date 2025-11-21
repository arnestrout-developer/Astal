import { Container, Graphics } from 'pixi.js';

export class Bullet extends Container {
  gfx: Graphics;
  speed: number;
  damage: number;

  constructor(x: number, y: number, speed = 600, damage = 1) {
    super();
    this.speed = speed; // pixels per second (design coords)
    this.damage = damage;

    this.gfx = new Graphics();
    this.gfx.beginFill(0xffffff);
    this.gfx.drawRect(-4, -8, 8, 16);
    this.gfx.endFill();
    this.addChild(this.gfx);

    this.position.set(x, y);
  }

  // delta is ticker.deltaTime (~1 at 60fps). Convert to seconds when moving.
  update(delta: number) {
    const deltaSeconds = delta / 60;
    this.y -= this.speed * deltaSeconds;
    // remove if off screen
    if (this.y < -32) return true;
    return false;
  }
}
