import { cpSync, existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function copyStatics() {
  return {
    name: 'copy-statics',
    closeBundle() {
      for (const file of ['edits-data.js', 'app.js']) {
        if (existsSync(file)) cpSync(file, `dist/${file}`);
      }
      if (existsSync('images')) cpSync('images', 'dist/images', { recursive: true });
    }
  };
}

export default defineConfig({
  plugins: [react(), copyStatics()],
  base: './',
  server: {
    open: true
  }
});
