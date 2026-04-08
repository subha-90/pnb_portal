import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/auth-proxy': {
        target: 'https://auth-dev-stage.iserveu.online',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-proxy/, '')
      },
      '/api-proxy': {
        target: 'https://api-dev-stage.iserveu.online',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, '')
      },
      '/cboi-proxy': {
        target: 'https://services-cboi-uat.isupay.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cboi-proxy/, '')
      },
      '/encr-proxy': {
        target: 'https://encr-decr.iserveu.online',
        changeOrigin: true,
        secure: false,
        headers: {
          'User-Agent': 'PostmanRuntime/7.43.0'
        },
        rewrite: (path) => path.replace(/^\/encr-proxy/, '')
      }
    }
  },
})
