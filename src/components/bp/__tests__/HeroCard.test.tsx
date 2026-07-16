/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import HeroCard from '../HeroCard'
import type { HeroWithStats } from '../../../types/hero'

// 组件测试：mock i18n 与 electron API，聚焦渲染分支与交互
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

const hero: HeroWithStats = {
  id: 'Ahri',
  name: '阿狸',
  title: '九尾妖狐',
  blurb: '',
  version: '14.10.5',
  image: { full: 'Ahri.png', sprite: 's', group: 'g', x: 0, y: 0, w: 48, h: 48 },
  tags: ['Mage', 'Assassin'],
}

beforeEach(() => {
  (global.window as unknown as { electronAPI: unknown }).electronAPI = {
    getHeroImageUrl: vi.fn(async () => ({ success: true, data: 'http://cdn/Ahri.png' })),
  }
})

afterEach(() => {
  vi.restoreAllMocks()
  ;(global.window as unknown as { electronAPI?: unknown }).electronAPI = undefined
})

const renderCard = (overrides: Partial<React.ComponentProps<typeof HeroCard>> = {}) =>
  render(
    <HeroCard
      hero={hero}
      isDisabled={false}
      isCurrentPhase
      actionType="ban"
      onSelect={() => {}}
      {...overrides}
    />,
  )

describe('HeroCard - 基础渲染', () => {
  it('渲染英雄名，并以 "名字 - 称号" 作为 title', () => {
    renderCard()
    expect(screen.getByText('阿狸')).toBeTruthy()
    expect(screen.getByTitle('阿狸 - 九尾妖狐')).toBeTruthy()
  })
})

describe('HeroCard - 状态分支（getCardStyle）', () => {
  it('isDisabled：不可交互、灰度、显示已选择绿点、无操作角标', () => {
    const { container } = renderCard({ isDisabled: true })
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('cursor-not-allowed')
    expect(card.className).toContain('grayscale')
    expect(card.querySelector('.bg-green-500')).toBeTruthy()
    expect(screen.queryByText('bp.ban')).toBeNull()
  })

  it('当前 ban 阶段：可交互、红方边框、显示 ban 角标', () => {
    const { container } = renderCard({ actionType: 'ban' })
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('cursor-pointer')
    expect(card.className).toContain('border-lol-red')
    expect(screen.getByText('bp.ban')).toBeTruthy()
  })

  it('当前 pick 阶段：蓝方边框、显示 pick 角标', () => {
    const { container } = renderCard({ actionType: 'pick' })
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-lol-blue')
    expect(screen.getByText('bp.pick')).toBeTruthy()
  })

  it('非当前阶段：半透明、不可交互、无角标', () => {
    const { container } = renderCard({ isCurrentPhase: false })
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('cursor-not-allowed')
    expect(card.className).toContain('opacity-50')
    expect(screen.queryByText('bp.ban')).toBeNull()
  })
})

describe('HeroCard - 交互', () => {
  it('点击触发 onSelect 并传入 heroId', () => {
    const onSelect = vi.fn()
    const { container } = renderCard({ onSelect })
    fireEvent.click(container.firstChild as HTMLElement)
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('Ahri')
  })
})

describe('HeroCard - 图片加载', () => {
  it('获取成功后渲染 img 并设置 src', async () => {
    const { container } = renderCard()
    await waitFor(() => {
      const img = container.querySelector('img')
      expect(img).toBeTruthy()
      expect(img?.getAttribute('src')).toBe('http://cdn/Ahri.png')
    })
  })

  it('获取失败时显示头像 fallback（svg，无 img）', async () => {
    (global.window as unknown as { electronAPI: unknown }).electronAPI = {
      getHeroImageUrl: vi.fn(async () => {
        throw new Error('fail')
      }),
    }
    const { container } = renderCard()
    await waitFor(() => {
      expect(container.querySelector('img')).toBeNull()
      expect(container.querySelector('svg')).toBeTruthy()
    })
  })
})
