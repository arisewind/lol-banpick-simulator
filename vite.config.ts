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
    // Windows Hyper-V/WSL2 会动态预留端口排除段,5173/5273 都曾落进排除区间
    // ([5145,5244] / [5245,5344]) 导致 bind ::1 报 EACCES。7357 不在任何排除段。
    // strictPort 固定端口,保证与 package.json 中 wait-on 的 URL 一致。
    port: 7357,
    strictPort: true,
  },
  base: './',
  build: {
    outDir: 'build/renderer',
    emptyOutDir: true,
  },
})
