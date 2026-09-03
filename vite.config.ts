import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Écoute sur toutes les interfaces : le téléphone joint le dev server via l'IP du PC.
    host: true,
  },
})
