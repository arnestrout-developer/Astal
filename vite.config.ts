import { defineConfig } from 'vite'

export default defineConfig({
  // Use page-relative paths so assets load correctly when site
  // is served from a subpath or GitHub Pages `docs/` folder.
  base: './',
  build: {
    outDir: 'docs',
  },
})
