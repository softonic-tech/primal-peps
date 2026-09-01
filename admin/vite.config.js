import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { orderEmailApiPlugin } from '../scripts/order-email-plugin.js'

export default defineConfig({
  plugins: [react(), orderEmailApiPlugin()],
  server: { port: 5174 },
})
