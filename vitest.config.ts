import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// 测试配置：模仿 LambChat 范式（分层测试 + jsdom 按文件标注）
// - 默认 environment: node（纯函数 / 后端逻辑，快）
// - 需要 DOM 的组件测试在文件顶部加 /** @vitest-environment jsdom */
// - 测试位置：src/**/__tests__/**/*.test.{ts,tsx,js}
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{ts,tsx,js}'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx,js}'],
      exclude: [
        'src/**/*.d.ts',
        'src/i18n/locales/**',
        'src/main/main.js',
        'src/main/preload.js',
        'src/**/__tests__/**',
      ],
      // 阈值定在略低于当前基准（基准：lines/stmts 31.7%、branches 85.8%、funcs 59.3%）
      // 卡回归但不一上来就红；补测试后覆盖率上升，阈值仍能过
      thresholds: {
        lines: 30,
        statements: 30,
        branches: 80,
        functions: 55,
      },
    },
  },
})
