import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'CineStream',
          short_name: 'CineStream',
          description: 'Premium Movie Streaming & Discovery Platform',
          theme_color: '#050505',
          background_color: '#050505',
          display: 'standalone',
          icons: [
            {
              src: '/src/assets/images/pwa_icon_1782117989848.jpg',
              sizes: '192x192',
              type: 'image/jpeg'
            },
            {
              src: '/src/assets/images/pwa_icon_1782117989848.jpg',
              sizes: '512x512',
              type: 'image/jpeg'
            },
            {
              src: '/src/assets/images/pwa_icon_1782117989848.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
