import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        find: './pages/HomePage',
        replacement: fileURLToPath(new URL('./src/pages/HomePageReservationSync.jsx', import.meta.url))
      }
    ]
  },
  server: {
    allowedHosts: [
      'earphone-subtly-numeral.ngrok-free.dev'
    ]
  }
})
