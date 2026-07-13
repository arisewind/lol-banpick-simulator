import { describe, it, expect } from 'vitest'
import { cn } from '../cn'

// 纯函数测试：模仿 LambChat 范式的"工具函数"层
describe('cn 类名组合工具', () => {
  it('拼接多个字符串类名', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('过滤掉所有 falsy 值（false/null/undefined/0/空串）', () => {
    expect(cn('a', false, null, undefined, 0, '', 'b')).toBe('a b')
  })

  it('递归展开嵌套数组', () => {
    expect(cn('a', ['b', ['c', 'd']])).toBe('a b c d')
  })

  it('根据对象的 truthy 值取键名', () => {
    expect(cn('a', { b: true, c: false, d: true })).toBe('a b d')
  })

  it('混合字符串、数组、对象', () => {
    expect(cn('base', ['arr'], { keep: true, drop: false })).toBe('base arr keep')
  })

  it('全部为 falsy 时返回空字符串', () => {
    expect(cn(false, null, undefined)).toBe('')
  })

  it('数字（即使为真）不被当作类名输出', () => {
    // cn 只处理 string/array/object；number 虽在类型签名中但不会被输出
    expect(cn(0, 1, 'x')).toBe('x')
  })
})
