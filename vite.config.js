import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: resolve(__dirname, './backend/static'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    },
    copyPublicDir: false,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8765'
    }
  },
})