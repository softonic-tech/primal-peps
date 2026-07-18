import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { signupApiPlugin } from './scripts/signup-api-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), signupApiPlugin()],
})
