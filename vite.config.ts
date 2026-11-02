import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to local network (phone & other devices)
    port: 5173,
    open: true, // Automatically pop open default browser
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/media': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
