import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Optimize build output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['./src/main.ts'],
        },
      },
    },
    // Source maps only in development
    sourcemap: false,
    // Reduce CSS size
    cssMinify: true,
    // Report compressed size
    reportCompressedSize: true,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Enable compression
    compression: 'gzip',
    // Optimize HMR
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
})
