
import { Container, Graphics } from 'pixi.js';

export class Enemy extends Container {
  graphics: Graphics;
  speed: number;
  movementType: 'straight' | 'sine';
  private timeAlive: number = 0;
  private startX: number;

  constructor(x: number, y: number, color: number = 0xff0000, movementType: 'straight' | 'sine' = 'straight') {
    super();
    this.speed = 2;
    this.movementType = movementType;
    this.startX = x;

    // Create a simple box graphic
    this.graphics = new Graphics();
    this.graphics.rect(-32, -32, 64, 64); // 64x64 box centered at origin
    this.graphics.fill(color);
    
    this.position.set(x, y);
    this.addChild(this.graphics);
  }

  update(delta: number) {
    this.timeAlive += delta;
    
    // Move downward
    this.y += this.speed * delta;

    // Apply movement pattern
    if (this.movementType === 'sine') {
      // Sine wave horizontal movement
      this.x = this.startX + Math.sin(this.timeAlive * 0.1) * 100;
    }

    // Check if enemy is off screen (below)
    if (this.y > 1080 + 64) {
      return true; // Signal that this enemy should be removed
    }
    return false; // Enemy is still active
  }
}
