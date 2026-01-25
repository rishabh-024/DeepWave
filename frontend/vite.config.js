import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { animate, keyframes } from 'framer-motion'

// https://vite.dev/config/
export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  theme: {
    extend: {
      animate:{
        'gradient-pulse':'graident-pulse 8s ease-in-out infinite',
        'gradient-pulse-delay':'gradient-pulse 8s ease-in-out 4s infinite',
      },
      keyframes: {
        'gradient-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.1' },
          '50%': { transform: 'scale(1.3)', opacity: '0.15' },
        }
      }
    }
  }
})
