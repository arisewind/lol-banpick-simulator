/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TeamSlot from '../TeamSlot'
import type { HeroWithStats } from '../../../types/hero'

// mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

const mockHero: HeroWithStats = {
  id: 'Ahri',
  name: '阿狸',
  title: '九尾妖狐',
  blurb: '',
  version: '14.10.5',
  image: { full: 'Ahri.png', sprite: 's', group: 'g', x: 0, y: 0, w: 48, h: 48 },
  tags: ['Mage', 'Assassin'],
  lanes: ['mid'],
}

// 无分路数据变体(heroService 对映射表外的英雄注入空数组)
const mockHeroNoLane: HeroWithStats = { ...mockHero, id: 'NoLane', name: '无分路', lanes: [] }

// mock HeroContext：getHeroById 返回预设英雄
vi.mock('../../../contexts/HeroContext', () => ({
  useHeroes: () => ({
    getHeroById: (id: string | null) => {
      if (id === 'Ahri') return mockHero
      if (id === 'NoLane') return mockHeroNoLane
      return null
    },
  }),
}))

// mock useHeroImage：有 id 返回 URL，无 id 返回空
vi.mock('../../../hooks/useHeroImage', () => ({
  useHeroImage: (id?: string) => ({
    imageUrl: id ? `http://cdn/${id}.png` : '',
    loading: false,
  }),
}))

// mock useHeroSplash：pick 槽用的原画 URL(有 id 返回 loading 原画,无 id 返回空)
vi.mock('../../../hooks/useHeroSplash', () => ({
  useHeroSplash: (id?: string) => ({
    splashUrl: id ? `http://cdn/${id}_loading.jpg` : '',
    splashError: false,
    isLoading: false,
  }),
}))

describe('TeamSlot - 空槽位', () => {
  it('heroId 为 null 时显示序号（index + 1）', () => {
    render(<TeamSlot heroId={null} type="ban" side="blue" index={2} />)
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('ban 空槽位使用固定正方形尺寸(64px),不随 ban-row 列数伸缩', () => {
    const { container } = render(<TeamSlot heroId={null} type="ban" side="blue" index={0} />)
    const slot = container.firstChild as HTMLElement
    // ban 槽:固定 w-16 h-16(64px) + shrink-0,保证两组 ban 槽净距一致(方案A)
    expect(slot.className).toContain('w-16')
    expect(slot.className).toContain('h-16')
    expect(slot.className).toContain('shrink-0')
  })
})

describe('TeamSlot - 已填充槽位', () => {
  it('有英雄时设置 title 为英雄名', () => {
    const { container } = render(<TeamSlot heroId="Ahri" type="pick" side="blue" index={0} />)
    const slot = container.firstChild as HTMLElement
    expect(slot.getAttribute('title')).toBe('阿狸')
  })

  it('pick 位的蓝方应用蓝色边框和发光', () => {
    const { container } = render(<TeamSlot heroId="Ahri" type="pick" side="blue" index={0} />)
    const slot = container.firstChild as HTMLElement
    expect(slot.className).toContain('border-lol-blue')
    expect(slot.className).toContain('shadow-blue-lg')
  })

  it('pick 位的红方应用红色边框和发光', () => {
    const { container } = render(<TeamSlot heroId="Ahri" type="pick" side="red" index={0} />)
    const slot = container.firstChild as HTMLElement
    expect(slot.className).toContain('border-lol-red')
    expect(slot.className).toContain('shadow-red-lg')
  })

  it('ban 位不应用战队色边框（使用通用边框）', () => {
    const { container } = render(<TeamSlot heroId="Ahri" type="ban" side="blue" index={0} />)
    const slot = container.firstChild as HTMLElement
    expect(slot.className).toContain('border-lol-border')
    expect(slot.className).not.toContain('border-lol-blue')
  })

  it('pick 位渲染英雄原画 img(优先原画,回退头像)', () => {
    const { container } = render(<TeamSlot heroId="Ahri" type="pick" side="blue" index={0} />)
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    // pick 槽优先用原画(useHeroSplash),故 src 是 loading 原画 URL
    expect(img?.getAttribute('src')).toBe('http://cdn/Ahri_loading.jpg')
  })

  it('pick 位底部显示英雄名', () => {
    render(<TeamSlot heroId="Ahri" type="pick" side="blue" index={0} />)
    expect(screen.getByText('阿狸')).toBeTruthy()
  })
})

describe('TeamSlot - 分路徽标(pickban.pro 风格)', () => {
  it('pick 槽有分路数据时渲染 PositionIcon(带 lanes 提示 title)', () => {
    const { container } = render(<TeamSlot heroId="Ahri" type="pick" side="blue" index={0} />)
    // mock 英雄 lanes = ['mid'] → 徽标 title 为分路 i18n 键(mock t 原样返回键名)
    expect(screen.getByTitle('hero.lanes.mid')).toBeTruthy()
    // PositionIcon 未传 title 时 aria-label 回退为 lane 名
    expect(container.querySelector('svg[aria-label="mid"]')).toBeTruthy()
  })

  it('无分路数据的英雄不渲染徽标', () => {
    // heroService 对映射表外的英雄注入空数组 → 不应有徽标
    const { container } = render(<TeamSlot heroId="NoLane" type="pick" side="blue" index={0} />)
    expect(screen.queryByTitle('hero.lanes.mid')).toBeNull()
    expect(container).toBeTruthy()
  })

  it('ban 槽不渲染分路徽标', () => {
    render(<TeamSlot heroId="Ahri" type="ban" side="blue" index={0} />)
    expect(screen.queryByTitle('hero.lanes.mid')).toBeNull()
  })
})

describe('TeamSlot - pick 交换交互(学 DraftLoL)', () => {
  it('传入 onSelect 时已填槽可点击,点击触发回调', () => {
    const onSelect = vi.fn()
    const { container } = render(<TeamSlot heroId="Ahri" type="pick" side="blue" index={0} onSelect={onSelect} />)
    const slot = container.firstChild as HTMLElement
    expect(slot.className).toContain('cursor-pointer')
    fireEvent.click(slot)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('不传 onSelect 时不可点击', () => {
    const { container } = render(<TeamSlot heroId="Ahri" type="pick" side="blue" index={0} />)
    const slot = container.firstChild as HTMLElement
    expect(slot.className).not.toContain('cursor-pointer')
  })

  it('isSwapSource 源槽金色描边常亮 + title 提示交换', () => {
    const { container } = render(
      <TeamSlot heroId="Ahri" type="pick" side="blue" index={0} onSelect={() => {}} isSwapSource />,
    )
    const slot = container.firstChild as HTMLElement
    expect(slot.className).toContain('ring-2')
    expect(slot.className).toContain('ring-lol-gold')
    expect(slot.getAttribute('title')).toBe('bp.swapSourceHint')
  })

  it('isSwapTarget 目标槽 hover 描边 + title 提示', () => {
    const { container } = render(
      <TeamSlot heroId="Ahri" type="pick" side="blue" index={0} onSelect={() => {}} isSwapTarget />,
    )
    const slot = container.firstChild as HTMLElement
    expect(slot.className).toContain('hover:ring-2')
    expect(slot.getAttribute('title')).toBe('bp.swapTargetHint')
  })
})
