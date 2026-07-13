/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { BPProvider, useBP } from '../BPContext'

// 组件/Hook 测试：模仿 LambChat 范式的 jsdom 环境
const wrapper = ({ children }: { children: ReactNode }) => <BPProvider>{children}</BPProvider>

const renderBP = () => renderHook(() => useBP(), { wrapper })

describe('BPContext 初始状态', () => {
  it('初始 currentPhase 为 0，蓝方先 ban', () => {
    const { result } = renderBP()
    expect(result.current.currentPhase).toBe(0)
    expect(result.current.getCurrentPhase()).toEqual({ step: 1, side: 'blue', action: 'ban' })
    expect(result.current.blueTeam.bans).toHaveLength(0)
    expect(result.current.isComplete).toBe(false)
  })
})

describe('BPContext banHero', () => {
  it('推进阶段并把英雄加入对应队伍的 ban 列表', () => {
    const { result } = renderBP()
    act(() => result.current.banHero('Ahri'))
    expect(result.current.currentPhase).toBe(1)
    expect(result.current.blueTeam.bans).toEqual(['Ahri'])
    // 下一手轮到红方 ban
    expect(result.current.getCurrentPhase()).toEqual({ step: 2, side: 'red', action: 'ban' })
  })

  it('在 pick 阶段调用 banHero 无效（不推进）', () => {
    const { result } = renderBP()
    // 推进到第 7 步（蓝方 pick）
    for (let i = 0; i < 6; i++) {
      act(() => result.current.banHero(`B${i}`))
    }
    expect(result.current.getCurrentPhase()?.action).toBe('pick')
    const phaseBefore = result.current.currentPhase
    act(() => result.current.banHero('ShouldNotWork'))
    expect(result.current.currentPhase).toBe(phaseBefore)
  })
})

describe('BPContext pickHero', () => {
  it('在 pick 阶段把英雄加入对应队伍 pick 列表', () => {
    const { result } = renderBP()
    // 走完 6 个 ban
    for (let i = 0; i < 6; i++) {
      act(() => result.current.banHero(`B${i}`))
    }
    act(() => result.current.pickHero('Yasuo'))
    expect(result.current.currentPhase).toBe(7)
    expect(result.current.blueTeam.picks).toEqual(['Yasuo'])
  })

  it('在 ban 阶段调用 pickHero 无效', () => {
    const { result } = renderBP()
    act(() => result.current.pickHero('Yasuo'))
    expect(result.current.currentPhase).toBe(0)
    expect(result.current.blueTeam.picks).toHaveLength(0)
  })
})

describe('BPContext 重复检测', () => {
  it('已被 ban 的英雄不能再次 ban 或 pick', () => {
    const { result } = renderBP()
    act(() => result.current.banHero('Ahri')) // 蓝方 ban
    // 红方尝试 ban 同一个英雄 → 应被拒绝
    act(() => result.current.banHero('Ahri'))
    expect(result.current.currentPhase).toBe(1)
    expect(result.current.redTeam.bans).toHaveLength(0)
    // 推进到 pick 阶段后，尝试 pick 已 ban 的英雄也无效
    for (let i = 1; i < 6; i++) {
      act(() => result.current.banHero(`B${i}`))
    }
    act(() => result.current.pickHero('Ahri'))
    expect(result.current.blueTeam.picks).toHaveLength(0)
  })
})

describe('BPContext undo', () => {
  it('撤销最后一步，恢复队伍列表与阶段', () => {
    const { result } = renderBP()
    act(() => result.current.banHero('Ahri'))
    act(() => result.current.banHero('Yasuo'))
    expect(result.current.currentPhase).toBe(2)
    act(() => result.current.undo())
    expect(result.current.currentPhase).toBe(1)
    expect(result.current.redTeam.bans).toHaveLength(0)
    expect(result.current.history).toHaveLength(1)
  })

  it('history 为空时 undo 无效', () => {
    const { result } = renderBP()
    act(() => result.current.undo())
    expect(result.current.currentPhase).toBe(0)
  })
})

describe('BPContext reset', () => {
  it('清空所有 BP 状态', () => {
    const { result } = renderBP()
    act(() => result.current.banHero('Ahri'))
    act(() => result.current.pickHero('Yasuo')) // 不会生效，但无妨
    act(() => result.current.reset())
    expect(result.current.currentPhase).toBe(0)
    expect(result.current.history).toHaveLength(0)
    expect(result.current.blueTeam.bans).toHaveLength(0)
    expect(result.current.isComplete).toBe(false)
  })
})

describe('BPContext 完整流程', () => {
  it('走完 20 步后 isComplete 为 true 且 getCurrentPhase 返回 null', () => {
    const { result } = renderBP()
    const heroes = Array.from({ length: 20 }, (_, i) => `H${i}`)
    for (const h of heroes) {
      act(() => {
        const phase = result.current.getCurrentPhase()
        if (!phase) return
        if (phase.action === 'ban') result.current.banHero(h)
        else result.current.pickHero(h)
      })
    }
    expect(result.current.currentPhase).toBe(20)
    expect(result.current.isComplete).toBe(true)
    expect(result.current.getCurrentPhase()).toBe(null)
    // 蓝红各 5 ban 5 pick
    expect(result.current.blueTeam.bans).toHaveLength(5)
    expect(result.current.redTeam.picks).toHaveLength(5)
  })

  it('BP 完成后继续操作无效', () => {
    const { result } = renderBP()
    const heroes = Array.from({ length: 20 }, (_, i) => `H${i}`)
    for (const h of heroes) {
      act(() => {
        const phase = result.current.getCurrentPhase()
        if (phase?.action === 'ban') result.current.banHero(h)
        else if (phase?.action === 'pick') result.current.pickHero(h)
      })
    }
    act(() => result.current.banHero('Extra'))
    expect(result.current.currentPhase).toBe(20)
  })
})
