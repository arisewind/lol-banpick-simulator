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
vi.mock('../../../contexts/HeroContext', () => ({
  useHeroes: () => ({
    getHeroById: (id: string | null) => (id ? { id, name: id, title: '', tags: [] } : null),
  }),
}))

// mock useHeroImage
vi.mock('../../../hooks/useHeroImage', () => ({
  useHeroImage: (id?: string) => ({
    imageUrl: id ? `http://cdn/${id}.png` : '',
    loading: false,
  }),
}))

describe('BanPickArena - 集成渲染（拆分后组合验证）', () => {
  it('渲染顶部阶段指示器（红方 pick 阶段）', () => {
    render(<BanPickArena />)
    expect(screen.getAllByText('bp.redTeam').length).toBeGreaterThan(0)
    expect(screen.getByText('bp.pickHero')).toBeTruthy()
  })

  it('渲染蓝队和红队标题', () => {
    render(<BanPickArena />)
    // bp.blueTeam / bp.redTeam 在阶段指示器和队名区都出现，用 getAllByText
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

  it('渲染中央紫色分隔区', () => {
    const { container } = render(<BanPickArena />)
    const divider = container.querySelector('.bg-lol-purple')
    expect(divider).toBeTruthy()
  })
})
