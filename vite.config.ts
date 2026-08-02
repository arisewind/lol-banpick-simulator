import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 改用 5273:5173 落在 Windows 保留端口排除区间 [5145,5244],
    // 会被 Hyper-V/WSL2 预留,bind ::1 时报 EACCES。strictPort 固定端口,
    // 保证与 package.json 中 wait-on 的 URL 一致,避免静默换端口后 wait-on 失配。
    port: 5273,
    strictPort: true,
  },
  base: './',
  build: {
    outDir: 'build/renderer',
    emptyOutDir: true,
  },
})
