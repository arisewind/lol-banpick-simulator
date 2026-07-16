/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
}

// mock HeroContext：getHeroById 返回预设英雄
vi.mock('../../../contexts/HeroContext', () => ({
  useHeroes: () => ({
    getHeroById: (id: string | null) => (id === 'Ahri' ? mockHero : null),
  }),
}))

// mock useHeroImage：有 id 返回 URL，无 id 返回空
vi.mock('../../../hooks/useHeroImage', () => ({
  useHeroImage: (id?: string) => ({
    imageUrl: id ? `http://cdn/${id}.png` : '',
    loading: false,
  }),
}))

describe('TeamSlot - 空槽位', () => {
  it('heroId 为 null 时显示序号（index + 1）', () => {
    render(<TeamSlot heroId={null} type="ban" side="blue" index={2} />)
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('ban 空槽位使用正方形尺寸', () => {
    const { container } = render(<TeamSlot heroId={null} type="ban" side="blue" index={0} />)
    const slot = container.firstChild as HTMLElement
    expect(slot.className).toContain('w-16')
    expect(slot.className).toContain('h-16')
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

  it('pick 位渲染英雄头像 img', () => {
    const { container } = render(<TeamSlot heroId="Ahri" type="pick" side="blue" index={0} />)
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('src')).toBe('http://cdn/Ahri.png')
  })

  it('pick 位底部显示英雄名', () => {
    render(<TeamSlot heroId="Ahri" type="pick" side="blue" index={0} />)
    expect(screen.getByText('阿狸')).toBeTruthy()
  })
})
