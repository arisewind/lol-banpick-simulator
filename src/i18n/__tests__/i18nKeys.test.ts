import { describe, it, expect } from 'vitest'
import zhCN from '../locales/zh-CN.json'
import zhTW from '../locales/zh-TW.json'
import en from '../locales/en.json'

// 递归收集对象所有叶子节点的 dot 路径（用于跨语言 key 一致性校验）
function collectKeyPaths(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>()
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object') {
      for (const sub of collectKeyPaths(v as Record<string, unknown>, path)) {
        keys.add(sub)
      }
    } else {
      keys.add(path)
    }
  }
  return keys
}

describe('i18n locale key 一致性', () => {
  const zhCNKeys = collectKeyPaths(zhCN as Record<string, unknown>)
  const zhTWKeys = collectKeyPaths(zhTW as Record<string, unknown>)
  const enKeys = collectKeyPaths(en as Record<string, unknown>)

  it('zh-TW 与 zh-CN 的 key 集合完全一致', () => {
    expect(zhTWKeys).toEqual(zhCNKeys)
  })

  it('en 与 zh-CN 的 key 集合完全一致', () => {
    expect(enKeys).toEqual(zhCNKeys)
  })
})
