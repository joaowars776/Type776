import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded correctly with relative paths
  server: {
    host: true // Exposes server to network, useful for some preview environments
  }
})