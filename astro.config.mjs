import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

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
    build: {
      target: 'es2022',
      minify: 'esbuild',
      sourcemap: false,
    },
  },
});
