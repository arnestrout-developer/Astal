import { Container, Text } from 'pixi.js';

export class Stats extends Container {
  private text: Text;

  constructor() {
    super();
    this.text = new Text(
      '',
      {
        fill: '#fff',
        fontSize: 18,
        fontFamily: 'monospace',
        stroke: '#000',
        padding: 8,
        align: 'right',
      }
    );
    this.addChild(this.text);
  }

  update(scale: number, fps: number) {
    this.text.text = `Scale: ${scale.toFixed(3)}\nFPS: ${Math.round(fps)}`;
    // Position 10px from top right of the design resolution
    this.text.x = 1920 - 10;
    this.text.y = 10;
    this.text.anchor.set(1, 0); // right-top anchor
  }
}
