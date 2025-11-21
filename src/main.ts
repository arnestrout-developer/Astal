

import './style.css';
import { Application, Assets } from 'pixi.js';
import { Hero } from './entities/hero';
import { Stats } from './entities/stats';
import { Enemy } from './entities/enemy';
import { pollGamepads } from './logic/controls';



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
  const texture = await Assets.load('src/assets/thunder.jpg');
  const hero = new Hero(texture);
  const stats = new Stats();
  app.stage.addChild(hero);
  app.stage.addChild(stats);

  updateScale();

  let lastTime = performance.now();
  let fps = 60;
  
  // Enemy management
  const enemies: Enemy[] = [];
  let spawnTimer = 0;
  const spawnInterval = 120; // Spawn enemy every 2 seconds at 60fps
  
  app.ticker.add((ticker) => {
    pollGamepads();
    hero.update(ticker.deltaTime);

    // Spawn enemies
    spawnTimer += ticker.deltaTime;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      // Random x position across the screen
      const x = Math.random() * 1920;
      // Random color (red, green, blue, yellow, magenta, cyan)
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
      const color = colors[Math.floor(Math.random() * colors.length)];
      // Random movement type
      const movementType = Math.random() > 0.5 ? 'straight' : 'sine';
      const enemy = new Enemy(x, -64, color, movementType);
      enemies.push(enemy);
      app.stage.addChild(enemy);
    }

    // Update enemies and remove off-screen ones
    for (let i = enemies.length - 1; i >= 0; i--) {
      const shouldRemove = enemies[i].update(ticker.deltaTime);
      if (shouldRemove) {
        app.stage.removeChild(enemies[i]);
        enemies.splice(i, 1);
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
