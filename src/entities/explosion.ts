import { Container, Graphics } from 'pixi.js';

export class Explosion extends Container {
  private gfx: Graphics;
  private elapsed = 0; // seconds
  private duration: number; // seconds
  private targetSize: number; // final radius in pixels
  private startScale = 0.05; // initial tiny scale multiplier

  /**
   * Create an explosion effect.
   * @param size final radius in pixels
   * @param duration seconds over which the explosion expands and fades
   */
  constructor(size = 32, duration = 0.5) {
    super();
    this.targetSize = Math.max(0, size);
    this.duration = Math.max(0.001, duration);

    this.gfx = new Graphics();
    // draw a unit circle at origin and scale it to the target size over time
    this.gfx.beginFill(0xffd27f); // gold-ish
    this.gfx.drawCircle(0, 0, 1);
    this.gfx.endFill();
    this.gfx.pivot.set(0, 0);

    // start almost invisible and very small
    this.gfx.scale.set(this.startScale * this.targetSize);
    this.gfx.alpha = 1;
    this.addChild(this.gfx);
  }

  /**
   * Update the explosion. Call from the main ticker with `ticker.deltaTime`.
   * Returns true when the explosion has finished and can be removed.
   */
  update(delta: number) {
    // delta is ticker.deltaTime (dimensionless where ~1 at 60fps)
    const deltaSeconds = delta / 60;
    this.elapsed += deltaSeconds;

    const t = Math.min(1, this.elapsed / this.duration);
    // interpolate scale from startScale*targetSize -> targetSize
    const scale = this.startScale * this.targetSize + (this.targetSize - this.startScale * this.targetSize) * t;
    this.gfx.scale.set(scale);

    // fade out alpha from 1 -> 0
    this.gfx.alpha = 1 - t;

    // finished when elapsed >= duration
    return this.elapsed >= this.duration;
  }
}

export default Explosion;
