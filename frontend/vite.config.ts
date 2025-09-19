import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // o 5173 si ese es tu puerto real
    proxy: {
      '/api': {
        target: 'http://localhost', // tu Laravel expuesto en 80
        changeOrigin: true,
      },
    },
  },
});
