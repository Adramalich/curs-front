import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        bookDetail: 'book-detail.html',
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});