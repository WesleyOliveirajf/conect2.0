import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import compression from "vite-plugin-compression";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
  base: '/',
  server: {
    port: 8080,
    host: '127.0.0.1',
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1'
    },
    strictPort: false
  },
  plugins: [
    react(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      threshold: 1024,
      ext: '.gz'
    }),
    // Brotli compression (melhor compressão)
    compression({
      algorithm: 'brotliCompress',
      threshold: 1024,
      ext: '.br'
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // React Core
          'react-vendor': ['react', 'react-dom'],

          // Routing
          'router': ['react-router-dom'],

          // UI Components
          'radix-ui': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ],

          // Icons
          'icons': ['lucide-react'],

          // Database & Storage
          'database': ['@supabase/supabase-js'],

          // State Management & Data Fetching
          'data': ['@tanstack/react-query'],

          // Utilities
          'utils': [
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'crypto-js',
            'dompurify'
          ],

          // Theming
          'theme': ['next-themes', 'tailwindcss-animate'],

          // Notifications
          'notifications': ['sonner']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 300
  },
  // PWA Configuration
  define: {
    __PWA_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __PWA_BUILD_DATE__: JSON.stringify(new Date().toISOString())
  }
}
});
