import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dev-only: forward API requests to the Express server.
  // This keeps the client using same-origin paths like `/api/auth/login`
  // while developing on Vite (:5173) + API on :3000.
  server: {
    proxy: {
      '/api': {
        // Use IPv4 loopback explicitly to avoid IPv6 (::1) connection issues on some setups.
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
          socketio: ['socket.io-client'],
          pdf: ['html2pdf.js', 'html2canvas'],
          chakra: ['@chakra-ui/react', '@chakra-ui/icons', '@emotion/react', '@emotion/styled', 'framer-motion'],
          vendor: ['react', 'react-dom', 'react-icons', 'papaparse'],
        },
      },
    },
  },
})
