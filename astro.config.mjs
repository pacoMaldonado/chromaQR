import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  server: {
    port: 1420,
    strictPort: true,
    host: false,
  },
  vite: {
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      target: 'es2022',
      minify: 'esbuild',
      sourcemap: false,
    },
  },
});
