import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Raise the warning threshold slightly since we're splitting properly
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached longest, changes least
          'vendor-react': ['react', 'react-dom', 'react-router'],
          // Firebase — large SDK, separate chunk so users with cached React
          // don't re-download Firebase on React updates
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
          // UI utilities
          'vendor-ui': ['react-toastify', 'sweetalert2', 'lucide-react'],
        },
      },
    },
  },
})
