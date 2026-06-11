import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the build works under the GitHub Pages project subpath
  // (https://<user>.github.io/ThumbnailGenerator/) as well as locally.
  base: './',
  plugins: [react()],
});
