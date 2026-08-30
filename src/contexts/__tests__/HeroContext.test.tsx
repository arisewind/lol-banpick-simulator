/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Hero } from '../../types/hero'
import { HeroProvider, useHeroes } from '../HeroContext'

// 组件/Hook 测试：模仿 LambChat 范式的 jsdom 环境
const sampleHeroes: Hero[] = [
  { id: 'Ahri', name: '阿狸', title: '九尾妖狐', blurb: '', version: '14.10.5', image: { full: 'Ahri.png', sprite: 's', group: 'g', x: 0, y: 0, w: 48, h: 48 }, tags: ['Mage', 'Assassin'], lanes: ['mid'] },
  { id: 'Garen', name: '盖伦', title: '德玛西亚之力', blurb: '', version: '14.10.5', image: { full: 'Garen.png', sprite: 's', group: 'g', x: 0, y: 0, w: 48, h: 48 }, tags: ['Fighter', 'Tank'], lanes: ['top'] },
  { id: 'Jinx', name: '金克丝', title: '暴走萝莉', blurb: '', version: '14.10.5', image: { full: 'Jinx.png', sprite: 's', group: 'g', x: 0, y: 0, w: 48, h: 48 }, tags: ['Marksman'], lanes: ['bot'] },
  { id: 'Lux', name: 'Lux', title: '光辉女郎', blurb: '', version: '14.10.5', image: { full: 'Lux.png', sprite: 's', group: 'g', x: 0, y: 0, w: 48, h: 48 }, tags: ['Mage'], lanes: ['mid', 'support'] },
]

const wrapper = ({ children }: { children: ReactNode }) => <HeroProvider>{children}</HeroProvider>
const renderHeroes = () => renderHook(() => useHeroes(), { wrapper })

beforeEach(() => {
  (global.window as unknown as { electronAPI: unknown }).electronAPI = {
    fetchHeroes: vi.fn(async () => ({ success: true, data: sampleHeroes })),
  }
})

afterEach(() => {
  vi.restoreAllMocks()
  ;(global.window as unknown as { electronAPI?: unknown }).electronAPI = undefined
})

describe('HeroContext 初始加载', () => {
  it('挂载后通过 electronAPI 加载英雄', async () => {
    const { result } = renderHeroes()
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.heroes).toHaveLength(4)
    // availableLanes 是固定常量(五个分路),不再从数据动态聚合
    expect(result.current.availableLanes).toEqual(['top', 'jungle', 'mid', 'bot', 'support'])
    expect(result.current.error).toBeNull()
  })
})

describe('HeroContext 搜索过滤', () => {
  it('按名字搜索', async () => {
    const { result } = renderHeroes()
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setSearchQuery('阿狸'))
    expect(result.current.filteredHeroes.map(h => h.id)).toEqual(['Ahri'])
  })

  it('按称号搜索', async () => {
    const { result } = renderHeroes()
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setSearchQuery('妖狐'))
    expect(result.current.filteredHeroes.map(h => h.id)).toEqual(['Ahri'])
  })

  it('大小写不敏感（英文名）', async () => {
    const { result } = renderHeroes()
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setSearchQuery('LUX'))
    expect(result.current.filteredHeroes.map(h => h.id)).toEqual(['Lux'])
  })

  it('无匹配时返回空列表', async () => {
    const { result } = renderHeroes()
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setSearchQuery('不存在的英雄'))
    expect(result.current.filteredHeroes).toHaveLength(0)
  })
})

describe('HeroContext 分路过滤', () => {
  it('OR 逻辑：满足任一选中分路即保留', async () => {
    const { result } = renderHeroes()
    await waitFor(() => expect(result.current.loading).toBe(false))
    // 选 top + bot:Garen(top)、Jinx(bot) 命中;Ahri/Lux(mid/support)不命中
    act(() => result.current.setSelectedLanes(['top', 'bot']))
    expect(result.current.filteredHeroes.map(h => h.id).sort()).toEqual(['Garen', 'Jinx'])
  })

  it('多分路英雄命中任一即保留(Lux 属 mid+support,选 support 命中)', async () => {
    const { result } = renderHeroes()
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setSelectedLanes(['support']))
    expect(result.current.filteredHeroes.map(h => h.id)).toEqual(['Lux'])
  })
})

describe('HeroContext refreshHeroes 失败', () => {
  it('请求失败时设置 error 且 heroes 为空', async () => {
    (global.window as unknown as { electronAPI: { fetchHeroes: unknown } }).electronAPI = {
      fetchHeroes: vi.fn(async () => ({ success: false, error: '网络错误' })),
    }
    const { result } = renderHeroes()
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('网络错误')
    expect(result.current.heroes).toHaveLength(0)
  })
})
