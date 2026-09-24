import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: 'Parô? Logística',
        short_name: 'Parô?',
        description: 'Gestão de paradas e roteiros logísticos.',
        theme_color: '#333333', // Cor do seu tema escuro (preto chumbo)
        background_color: '#ffffff',
        display: 'standalone', // Isso tira a barra de endereço do navegador no celular!
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
