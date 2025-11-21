

import './style.css';
import { Application, Assets } from 'pixi.js';
import { Hero } from './entities/hero';
import { Stats } from './entities/stats';
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
  
  app.ticker.add((ticker) => {
    pollGamepads();
    hero.update(ticker.deltaTime);

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
