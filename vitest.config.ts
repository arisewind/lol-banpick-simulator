import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// 测试配置：模仿 LambChat 范式（分层测试 + jsdom 按文件标注）
// - 默认 environment: node（纯函数 / 后端逻辑，快）
// - 需要 DOM 的组件测试在文件顶部加 /** @vitest-environment jsdom */
// - 测试位置：src/**/__tests__/**/*.test.{ts,tsx,js}
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{ts,tsx,js}'],
    setupFiles: ['./vitest.setup.ts'],
  },
})
