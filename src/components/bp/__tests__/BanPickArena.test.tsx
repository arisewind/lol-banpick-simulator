/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import BanPickArena from '../BanPickArena'
import type { BPPhase, TeamState } from '../../../contexts/BPContext'

// mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

// 预设 BP 状态
const mockBlueTeam: TeamState = {
  bans: ['Zed', 'Yasuo'],
  picks: ['Ahri'],
}
const mockRedTeam: TeamState = {
  bans: ['Lux'],
  picks: [],
}
const mockPhase: BPPhase = { step: 8, side: 'red', action: 'pick' }

// mock BPContext：保留实际导出（SLOTS_PER_TEAM 等），仅替换 useBP
vi.mock('../../../contexts/BPContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../contexts/BPContext')>()
  return {
    ...actual,
    useBP: () => ({
      blueTeam: mockBlueTeam,
      redTeam: mockRedTeam,
      getCurrentPhase: () => mockPhase,
    }),
  }
})

// mock HeroContext：getHeroById 返回英雄名映射
// 新布局下 BanPickArena 内含 HeroGrid,需补全 useHeroes 的全部字段
vi.mock('../../../contexts/HeroContext', () => ({
  useHeroes: () => ({
    getHeroById: (id: string | null) => (id ? { id, name: id, title: '', tags: [] } : null),
    filteredHeroes: [],
    searchQuery: '',
    setSearchQuery: () => {},
    selectedTags: [],
    setSelectedTags: () => {},
    availableTags: [],
    loading: false,
    error: null,
    refreshHeroes: () => {},
  }),
}))

// mock useHeroImage
vi.mock('../../../hooks/useHeroImage', () => ({
  useHeroImage: (id?: string) => ({
    imageUrl: id ? `http://cdn/${id}.png` : '',
    loading: false,
  }),
}))

// mock useHeroSplash(pick 槽原画)
vi.mock('../../../hooks/useHeroSplash', () => ({
  useHeroSplash: (id?: string) => ({
    splashUrl: id ? `http://cdn/${id}_loading.jpg` : '',
    splashError: false,
    isLoading: false,
  }),
}))

describe('BanPickArena - 集成渲染（三列横向布局）', () => {
  it('渲染蓝队和红队面板标题', () => {
    render(<BanPickArena />)
    // 队名标签在 TeamSection 顶部(bp.blueTeam / bp.redTeam)
    expect(screen.getAllByText('bp.blueTeam').length).toBeGreaterThan(0)
    expect(screen.getAllByText('bp.redTeam').length).toBeGreaterThan(0)
  })

  it('蓝方已填充英雄的 ban 槽位设置正确 title', () => {
    const { container } = render(<BanPickArena />)
    const titledSlots = container.querySelectorAll('[title="Zed"], [title="Yasuo"]')
    expect(titledSlots.length).toBe(2)
  })

  it('蓝方已填充的 pick 英雄显示英雄名', () => {
    render(<BanPickArena />)
    // pick 位底部会显示英雄名（Ahri → 这里 getHeroById 返回 name=id）
    expect(screen.getAllByText('Ahri').length).toBeGreaterThan(0)
  })

  it('渲染中央紫色分隔元素', () => {
    const { container } = render(<BanPickArena />)
    // 中列顶部紫色装饰条 + 左右边框(均为 .bg-lol-purple / border-lol-purple)
    const purple = container.querySelector('.bg-lol-purple')
    expect(purple).toBeTruthy()
  })

  it('中列渲染英雄选择区', () => {
    render(<BanPickArena />)
    // HeroGrid 的搜索框 placeholder 存在,证明中列英雄选择区已渲染
    expect(screen.getByPlaceholderText('hero.searchPlaceholder')).toBeTruthy()
  })
})
