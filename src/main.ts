

import './style.css';
import { Application, Texture } from 'pixi.js';
import { Hero } from './entities/hero';
import { Stats } from './entities/stats';
import { Lives } from './entities/lives';
import { Enemy } from './entities/enemy';
import { Bullet } from './entities/bullet';
import Explosion from './entities/explosion';
import { controlState, pollGamepads } from './logic/controls';
import { loadTextures, textures } from './assets/textures';



const app = new Application();
await app.init({
  background: 0x000000,
  resizeTo: window,
});
// Set ticker to 60fps
app.ticker.maxFPS = 60;


// Default design resolution
const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

function updateScale() {
  const scaleX = window.innerWidth / DEFAULT_WIDTH;
  const scaleY = window.innerHeight / DEFAULT_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  app.stage.scale.set(scale);
  // Center the stage
  app.stage.position.set(
    (window.innerWidth - DEFAULT_WIDTH * scale) / 2,
    (window.innerHeight - DEFAULT_HEIGHT * scale) / 2
  );
}

window.addEventListener('resize', () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  updateScale();
});


const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
  appDiv.innerHTML = '';
  appDiv.appendChild(app.canvas);
}

// Load the hero sprite and add to stage
async function setup() {
  // Load hero directional textures and the lives/thumb texture via textures module
  await loadTextures();

  const hero = new Hero(textures.up as Texture, textures.left as Texture, textures.right as Texture);
  const stats = new Stats();
  const lives = new Lives(textures.thumb as Texture, 5);
  app.stage.addChild(hero);
  app.stage.addChild(stats);
  app.stage.addChild(lives);

  // Game over overlay (DOM) created once
  const gameOverOverlay = document.createElement('div');
  gameOverOverlay.id = 'game-over-overlay';
  gameOverOverlay.style.position = 'fixed';
  gameOverOverlay.style.left = '0';
  gameOverOverlay.style.top = '0';
  gameOverOverlay.style.width = '100vw';
  gameOverOverlay.style.height = '100vh';
  gameOverOverlay.style.display = 'none';
  gameOverOverlay.style.alignItems = 'center';
  gameOverOverlay.style.justifyContent = 'center';
  gameOverOverlay.style.background = 'rgba(0,0,0,0.6)';
  gameOverOverlay.style.zIndex = '2000';

  const panel = document.createElement('div');
  panel.style.background = '#111';
  panel.style.color = '#fff';
  panel.style.padding = '24px';
  panel.style.borderRadius = '8px';
  panel.style.textAlign = 'center';
  panel.style.minWidth = '320px';

  const msg = document.createElement('div');
  msg.innerText = 'Game Over';
  msg.style.fontSize = '1.6rem';
  msg.style.marginBottom = '12px';
  panel.appendChild(msg);

  const btn = document.createElement('button');
  btn.innerText = 'New Game';
  btn.style.padding = '8px 16px';
  btn.style.fontSize = '1rem';
  btn.style.cursor = 'pointer';
  panel.appendChild(btn);

  gameOverOverlay.appendChild(panel);
  document.body.appendChild(gameOverOverlay);

  function hideGameOver() {
    gameOverOverlay.style.display = 'none';
    // resume ticker
    app.ticker.start();
  }

  btn.addEventListener('click', () => {
    // Reset game state: clear enemies, reset hero and lives, hide overlay and resume
    for (let e of enemies) app.stage.removeChild(e);
    enemies.length = 0;
    lives.setLives(5);
    hero.reset();
    hideGameOver();
  });

  updateScale();

  let lastTime = performance.now();
  let fps = 60;
  
  // Enemy management
  const enemies: Enemy[] = [];
  let spawnTimer = 0;
  const spawnInterval = 120; // Spawn enemy every 2 seconds at 60fps
  // Bullet management
  const bullets: Bullet[] = [];
  // Explosion management
  const explosions: Explosion[] = [];
  let fireCooldown = 0; // seconds
  const fireRate = 15; // bullets per second while held
  const fireInterval = 1 / fireRate;
  
  app.ticker.add((ticker) => {
    pollGamepads();
    hero.update(ticker.deltaTime);

    // Spawn enemies
    spawnTimer += ticker.deltaTime;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      // Random x position across the screen
      const x = Math.random() * DEFAULT_WIDTH;
      // Random color (red, green, blue, yellow, magenta, cyan)
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
      const color = colors[Math.floor(Math.random() * colors.length)];
      // Random movement type
      const movementType = Math.random() > 0.5 ? 'straight' : 'sine';
      const enemy = new Enemy(x, -64, DEFAULT_HEIGHT, color, movementType);
      enemies.push(enemy);
      app.stage.addChild(enemy);
    }

    // Update enemies and remove off-screen ones
    for (let i = enemies.length - 1; i >= 0; i--) {
      const shouldRemove = enemies[i].update(ticker.deltaTime);
      // Collision detection with hero
      const heroBounds = hero.getBounds();
      const enemyBounds = enemies[i].getBounds();
      const collides = heroBounds.x < enemyBounds.x + enemyBounds.width &&
        heroBounds.x + heroBounds.width > enemyBounds.x &&
        heroBounds.y < enemyBounds.y + enemyBounds.height &&
        heroBounds.y + heroBounds.height > enemyBounds.y;
      if (collides && !hero.isInvincible) {
        // Hit: decrement lives and make hero invincible
        const remaining = Math.max(0, lives.getLives() - 1);
        lives.setLives(remaining);
        hero.startInvincible(2);
        // remove the enemy that hit the hero
        app.stage.removeChild(enemies[i]);
        enemies.splice(i, 1);
        // If no lives remaining, show game over and stop
        if (remaining <= 0) {
          gameOverOverlay.style.display = 'flex';
          app.ticker.stop();
        }
        continue;
      }
      if (shouldRemove) {
        app.stage.removeChild(enemies[i]);
        enemies.splice(i, 1);
      }
    }

    // Handle firing (continuous while held)
    const deltaSeconds = ticker.deltaTime / 60;
    if (controlState.fire) {
      fireCooldown -= deltaSeconds;
      while (fireCooldown <= 0) {
        // spawn a bullet at hero position
        const bx = hero.sprite.x;
        const by = hero.sprite.y - hero.sprite.height / 3 - 8;
        const ba = new Bullet(bx-5, by, 900, 1);
        const bb = new Bullet(bx+5, by, 900, 1);
        bullets.push(ba);
        app.stage.addChild(ba);
        bullets.push(bb);
        app.stage.addChild(bb);
        fireCooldown += fireInterval;
      }
    } else {
      // when not firing, reset small cooldown to allow immediate fire next press
      if (fireCooldown < 0) fireCooldown = 0;
    }

    // Update bullets and remove off-screen ones
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const bullet = bullets[bi];
      const removeBullet = bullet.update(ticker.deltaTime);
      if (removeBullet) {
        app.stage.removeChild(bullet);
        bullets.splice(bi, 1);
        continue;
      }
      // Bullet - Enemy collisions
      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const enemy = enemies[ei];
        const bBounds = bullet.getBounds();
        const eBounds = enemy.getBounds();
        const hit = bBounds.x < eBounds.x + eBounds.width &&
          bBounds.x + bBounds.width > eBounds.x &&
          bBounds.y < eBounds.y + eBounds.height &&
          bBounds.y + bBounds.height > eBounds.y;
        if (hit) {
          // apply damage
          enemy.takeDamage(bullet.damage);
          // apply an upward knockback to the enemy's vertical velocity
          try {
            (enemy as any).vy = -18; // units consistent with enemy.vy (pixels per tick unit)
          } catch (e) {
            // ignore if enemy doesn't expose vy for some reason
          }

          // spawn a small explosion at the bullet location
          const bx = bullet.x ?? (bBounds.x + bBounds.width / 2);
          const by = bullet.y ?? (bBounds.y + bBounds.height / 2);
          const smallExpl = new Explosion(16, 0.25);
          smallExpl.position.set(bx, by);
          explosions.push(smallExpl);
          app.stage.addChild(smallExpl);

          // remove the bullet
          app.stage.removeChild(bullet);
          bullets.splice(bi, 1);

          // if enemy died from this hit, spawn a larger explosion at enemy location
          if (enemy.hp <= 0) {
            const ex = new Explosion(64, 0.6);
            ex.position.set(enemy.x, enemy.y);
            explosions.push(ex);
            app.stage.addChild(ex);

            app.stage.removeChild(enemy);
            enemies.splice(ei, 1);
          }
          break;
        }
      }
    }

    // Update explosions and remove finished ones
    for (let xi = explosions.length - 1; xi >= 0; xi--) {
      const expl = explosions[xi];
      const done = expl.update(ticker.deltaTime);
      if (done) {
        app.stage.removeChild(expl);
        explosions.splice(xi, 1);
      }
    }

    // FPS calculation
    const now = performance.now();
    fps = 1000 / (now - lastTime);
    lastTime = now;

    // Get current scale from stage
    const scale = app.stage.scale.x;
    stats.update(scale, fps);
  });
}

setup();
