import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works both locally and on GitHub Pages
  // (which serves the game from /viaggio-in-italia/).
  base: './',
  server: { port: 5173 },
});
