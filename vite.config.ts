import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANTE: Si tu repositorio en GitHub se llama distinto a "satcs-dashboard",
// cambia el valor de "base" abajo por "/<NOMBRE-DE-TU-REPO>/".
// Esto es necesario para que los assets carguen correctamente en GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/satcs-dashboard/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
});
