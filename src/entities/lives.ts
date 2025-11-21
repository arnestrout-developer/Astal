import { Container, Sprite, Texture } from 'pixi.js';

export class Lives extends Container {
  private sprites: Sprite[] = [];
  private texture: Texture;
  private count: number;

  constructor(texture: Texture, initial = 5) {
    super();
    this.texture = texture;
    this.count = initial;
    this.createSprites(initial);
  }

  private createSprites(n: number) {
    // Clear existing
    this.removeChildren();
    this.sprites = [];

    const targetWidth = 32;
    const scale = targetWidth / this.texture.width;
    const spacing = 8;
    const padding = 10;

    for (let i = 0; i < n; i++) {
      const s = new Sprite(this.texture);
      s.anchor.set(0.5);
      s.scale.set(scale);
      // position in design coords (1920x1080)
      const halfW = s.width / 2;
      const halfH = s.height / 2;
      s.x = padding + halfW + i * (s.width + spacing);
      s.y = 1080 - padding - halfH;
      this.addChild(s);
      this.sprites.push(s);
    }
  }

  setLives(n: number) {
    this.count = Math.max(0, n);
    this.createSprites(this.count);
  }

  getLives() {
    return this.count;
  }
}
