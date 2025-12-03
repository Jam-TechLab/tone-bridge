import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa' // ← インポート忘れずに！

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'ToneBridge', // アプリの正式名称
        short_name: 'ToneBridge', // ホーム画面の下に出る名前
        description: '固定ドと移動ドを瞬時に変換・可視化する音楽ユーティリティ',
        theme_color: '#222222', // ステータスバーの色（アプリの背景色に合わせる）
        background_color: '#222222',
        display: 'standalone', // ★超重要：これでブラウザのバーが消える！
        orientation: 'any', // 縦でも横でも使えるようにする
        icons: [
          {
            src: '/android-chrome-192x192.png', // ← 絶対パスに修正！
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png', // ← 絶対パスに修正！
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
