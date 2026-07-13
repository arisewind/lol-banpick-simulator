import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// jest-dom matchers：vitest 未开 globals，不能裸 import '@testing-library/jest-dom'
// （它会在加载时引用全局 expect，而 expect 非全局 → ReferenceError）。
// 改用 matchers 子路径 + 显式 expect.extend 注册。
expect.extend(matchers)

// 每个测试结束后自动卸载组件 DOM，避免 screen 全局查询跨用例污染。
// （vitest 未开 globals 时，@testing-library/react 的内置 auto-cleanup 不会触发，
//  需在此显式注册。）
afterEach(() => {
  cleanup()
})
