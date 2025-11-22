
import { Container, Sprite } from 'pixi.js';
import { textures } from '../assets/textures';

export class Enemy extends Container {
  sprite: Sprite;
  vx: number = 0;
  vy: number = 0;
  speed: number;
  movementType: 'straight' | 'sine';
  private timeAlive: number = 0;
  private startX: number;
  private screenHeight: number;
  hp: number;
  private prevDx: number = 0;
  private turnTimer = 0; // seconds to show turn texture

  constructor(x: number, y: number, screenHeight: number, _color: number = 0xff0000, movementType: 'straight' | 'sine' = 'straight') {
    super();
    this.speed = 2;
    this.movementType = movementType;
    this.startX = x;
    this.screenHeight = screenHeight;
    this.hp = 15;
    // Create sprite using enemy texture if available
    const tex = textures.enemy_left;
    this.sprite = new Sprite(tex);
    this.sprite.anchor.set(0.5);
    // scale sprite to ~64px width if texture present
    if (this.sprite.texture && this.sprite.texture.width > 0) {
      const targetWidth = 64;
      const s = targetWidth / this.sprite.texture.width;
      this.sprite.scale.set(s);
    }

    this.position.set(x, y);
    this.addChild(this.sprite);
  }

  update(delta: number) {
    this.timeAlive += delta;

    // Compute velocities (pixels per tick unit)
    // Vertical velocity: target is move downwards by speed (in pixels per tick unit)
    const targetVy = this.speed * delta;
    // Smooth vy using exponential lerp so changes persist a few frames
    // Convert ticker delta to seconds
    const deltaSeconds = delta / 60;
    // Time constant (seconds) controlling smoothing — ~0.08s gives a short smoothing window
    const tau = 0.08;
    const alpha = 1 - Math.exp(-deltaSeconds / tau);
    this.vy += (targetVy - this.vy) * alpha;

    // Horizontal velocity depends on movement type
    if (this.movementType === 'sine') {
      // Target X from sine pattern
      const targetX = this.startX + Math.sin(this.timeAlive * 0.1) * 100;
      // Set vx to reach target in this tick (previous behavior snapped to target)
      this.vx = targetX - this.x;
    } else {
      this.vx = 0;
    }

    // Apply velocities to position
    this.x += this.vx;
    this.y += this.vy;

    // Determine horizontal delta and decide texture (use vx as delta)
    const dx = this.vx;

    // If we just switched from moving left to moving right, show turn texture briefly
    if (this.prevDx < -0.1 && dx > 0.1) {
      this.turnTimer = 0.25; // show turn texture for 0.25s
    }

    if (this.turnTimer > 0) {
      this.turnTimer = Math.max(0, this.turnTimer - deltaSeconds);
      if (textures.enemy_turn) {
        this.sprite.texture = textures.enemy_turn;
        // when turning to right, flip horizontally
        this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
      }
    } else {
      // steady facing: left or right
      if (dx < -0.1) {
        if (textures.enemy_left) {
          this.sprite.texture = textures.enemy_left;
          this.sprite.scale.x = Math.abs(this.sprite.scale.x);
        }
      } else if (dx > 0.1) {
        // face right by flipping the left texture
        if (textures.enemy_left) {
          this.sprite.texture = textures.enemy_left;
          this.sprite.scale.x = -Math.abs(this.sprite.scale.x);
        }
      }
    }

    this.prevDx = dx;

    // Check if enemy is off screen (below)
    if (this.y > this.screenHeight + 64) {
      return true; // Signal that this enemy should be removed
    }
    // If HP depleted, signal removal
    if (this.hp <= 0) return true;
    return false; // Enemy is still active
  }

  takeDamage(amount: number) {
    this.hp -= amount;
  }
}
