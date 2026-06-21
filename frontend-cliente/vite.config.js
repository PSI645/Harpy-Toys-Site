import { defineConfig, preview } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  preview: {
    allowedHosts: ["app"],
  },
})

