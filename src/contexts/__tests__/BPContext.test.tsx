/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { BPProvider, useBP, BP_PHASES, type BPSnapshot } from '../BPContext'

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

describe('BPContext undo 链', () => {
  it('连续撤销多步，逐次回退阶段直到 0', () => {
    const { result } = renderBP()
    act(() => result.current.banHero('A'))
    act(() => result.current.banHero('B'))
    act(() => result.current.banHero('C'))
    expect(result.current.currentPhase).toBe(3)
    act(() => result.current.undo())
    expect(result.current.currentPhase).toBe(2)
    act(() => result.current.undo())
    expect(result.current.currentPhase).toBe(1)
    act(() => result.current.undo())
    expect(result.current.currentPhase).toBe(0)
    expect(result.current.history).toHaveLength(0)
  })

  it('撤销后英雄重新可用，可再次选择', () => {
    const { result } = renderBP()
    act(() => result.current.banHero('Ahri'))
    expect(result.current.blueTeam.bans).toEqual(['Ahri'])
    act(() => result.current.undo())
    expect(result.current.blueTeam.bans).toHaveLength(0)
    // Ahri 重新可用，回到 phase 0（蓝方 ban）可再次 ban
    act(() => result.current.banHero('Ahri'))
    expect(result.current.blueTeam.bans).toEqual(['Ahri'])
    expect(result.current.currentPhase).toBe(1)
  })
})

describe('BPContext BP_PHASES 顺序表', () => {
  it('20 步顺序符合 ABABAB / ABBAAB / BABA / BAAB', () => {
    expect(BP_PHASES).toHaveLength(20)
    const sequence = BP_PHASES.map(p => `${p.side}:${p.action}`)
    expect(sequence).toEqual([
      'blue:ban', 'red:ban', 'blue:ban', 'red:ban', 'blue:ban', 'red:ban',
      'blue:pick', 'red:pick', 'red:pick', 'blue:pick', 'blue:pick', 'red:pick',
      'red:ban', 'blue:ban', 'red:ban', 'blue:ban',
      'red:pick', 'blue:pick', 'blue:pick', 'red:pick',
    ])
  })
})

describe('BPContext 反向重复检测', () => {
  it('已 pick 的英雄不能在后续 ban 阶段被 ban', () => {
    const { result } = renderBP()
    // step 1-6：ban 6 个
    for (let i = 0; i < 6; i++) {
      act(() => result.current.banHero(`B${i}`))
    }
    // step 7-12：pick 6 个
    for (let i = 0; i < 6; i++) {
      act(() => result.current.pickHero(`P${i}`))
    }
    // 现在到 step 13（红方 ban）。redTeam.bans 已含 step2/4/6 的 B1/B3/B5
    expect(result.current.getCurrentPhase()?.action).toBe('ban')
    const phaseBefore = result.current.currentPhase
    const redBansBefore = result.current.redTeam.bans.length
    // 尝试 ban 已 pick 的 P0 → 应被拒绝
    act(() => result.current.banHero('P0'))
    expect(result.current.currentPhase).toBe(phaseBefore)
    expect(result.current.redTeam.bans).toHaveLength(redBansBefore)
    expect(result.current.redTeam.bans).not.toContain('P0')
  })
})

describe('BPContext loadSnapshot', () => {
  const validSnapshot: BPSnapshot = {
    currentPhase: 7,
    blueTeam: { bans: ['B0'], picks: ['P0'] },
    redTeam: { bans: ['B1'], picks: [] },
    history: [{ step: 1, side: 'blue', action: 'ban', heroId: 'B0', timestamp: 0 }],
    isComplete: false,
  }

  it('有效快照恢复 BP 状态并返回 true', () => {
    const { result } = renderBP()
    let ok = false
    act(() => { ok = result.current.loadSnapshot(validSnapshot) })
    expect(ok).toBe(true)
    expect(result.current.currentPhase).toBe(7)
    expect(result.current.blueTeam.picks).toEqual(['P0'])
    expect(result.current.redTeam.bans).toEqual(['B1'])
  })

  it('缺少必需字段时拒绝、返回 false 且不改状态', () => {
    const { result } = renderBP()
    act(() => result.current.banHero('Original'))
    const phaseBefore = result.current.currentPhase
    let ok = true
    act(() => { ok = result.current.loadSnapshot({ currentPhase: 5 } as unknown as BPSnapshot) })
    expect(ok).toBe(false)
    expect(result.current.currentPhase).toBe(phaseBefore)
  })

  it('字段类型错误时拒绝（currentPhase 非数字）', () => {
    const { result } = renderBP()
    let ok = true
    act(() => {
      ok = result.current.loadSnapshot({ ...validSnapshot, currentPhase: 'bad' } as unknown as BPSnapshot)
    })
    expect(ok).toBe(false)
  })
})

describe('BPContext swapPicks', () => {
  // 走完 6 个 ban + 6 个 pick:blue.picks = [P0,P3,P4](step 7,10,11),red.picks = [P1,P2,P5]
  const fillAll = (bp: { current: ReturnType<typeof useBP> }) => {
    for (let i = 0; i < 6; i++) act(() => bp.current.banHero(`B${i}`))
    for (let i = 0; i < 6; i++) act(() => bp.current.pickHero(`P${i}`))
  }

  it('交换同队两个已填的 pick 槽', () => {
    const { result } = renderBP()
    fillAll(result)
    act(() => result.current.swapPicks('blue', 0, 1))
    expect(result.current.blueTeam.picks).toEqual(['P3', 'P0', 'P4'])
  })

  it('交换不影响另一队与 history', () => {
    const { result } = renderBP()
    fillAll(result)
    const historyBefore = result.current.history
    act(() => result.current.swapPicks('red', 0, 2))
    expect(result.current.redTeam.picks).toEqual(['P5', 'P2', 'P1'])
    expect(result.current.blueTeam.picks).toEqual(['P0', 'P3', 'P4'])
    expect(result.current.history).toBe(historyBefore)
    expect(result.current.currentPhase).toBe(12)
  })

  it('空槽参与交换无效', () => {
    const { result } = renderBP()
    for (let i = 0; i < 6; i++) act(() => result.current.banHero(`B${i}`))
    act(() => result.current.pickHero('Only')) // blue.picks = ['Only'],picks[1] 未填
    act(() => result.current.swapPicks('blue', 0, 1))
    expect(result.current.blueTeam.picks).toEqual(['Only'])
  })

  it('非法索引或相同索引无效', () => {
    const { result } = renderBP()
    fillAll(result)
    act(() => result.current.swapPicks('blue', -1, 1))
    act(() => result.current.swapPicks('blue', 0, 5))
    act(() => result.current.swapPicks('blue', 2, 2))
    expect(result.current.blueTeam.picks).toEqual(['P0', 'P3', 'P4'])
  })

  it('交换后 undo 仍正确撤销最后一步 pick(undo 按 heroId 剔除)', () => {
    const { result } = renderBP()
    fillAll(result)
    act(() => result.current.swapPicks('blue', 0, 1))
    act(() => result.current.undo())
    // 最后一步是 step12 红方 pick P5,与蓝方交换无关
    expect(result.current.redTeam.picks).toEqual(['P1', 'P2'])
    expect(result.current.currentPhase).toBe(11)
  })
})

describe('BPContext 无畏征召(Fearless Draft)', () => {
  it('默认关闭且 fearlessUsed 为空', () => {
    const { result } = renderBP()
    expect(result.current.fearlessEnabled).toBe(false)
    expect(result.current.fearlessUsed).toEqual([])
  })

  it('开启开关后 startNextGame 累计本局英雄并重置流程', () => {
    const { result } = renderBP()
    act(() => result.current.setFearlessEnabled(true))
    act(() => result.current.banHero('Ahri'))
    act(() => result.current.banHero('Yasuo'))
    act(() => result.current.startNextGame())
    expect(result.current.currentPhase).toBe(0)
    expect(result.current.history).toHaveLength(0)
    expect(result.current.isComplete).toBe(false)
    expect(result.current.fearlessUsed).toEqual(['Ahri', 'Yasuo'])
    // 开关保持
    expect(result.current.fearlessEnabled).toBe(true)
  })

  it('下一局中 fearlessUsed 英雄不能被 ban/pick', () => {
    const { result } = renderBP()
    act(() => result.current.setFearlessEnabled(true))
    act(() => result.current.banHero('Ahri'))
    act(() => result.current.startNextGame())
    act(() => result.current.banHero('Ahri'))
    expect(result.current.currentPhase).toBe(0)
    expect(result.current.blueTeam.bans).toHaveLength(0)
  })

  it('开关关闭时 startNextGame 不累计(普通重置)', () => {
    const { result } = renderBP()
    act(() => result.current.banHero('Ahri'))
    act(() => result.current.startNextGame())
    expect(result.current.currentPhase).toBe(0)
    expect(result.current.fearlessUsed).toEqual([])
  })

  it('本局无操作时 startNextGame 无效', () => {
    const { result } = renderBP()
    act(() => result.current.setFearlessEnabled(true))
    act(() => result.current.startNextGame())
    expect(result.current.fearlessUsed).toEqual([])
  })

  it('跨多局去重累计', () => {
    const { result } = renderBP()
    act(() => result.current.setFearlessEnabled(true))
    act(() => result.current.banHero('Ahri'))
    act(() => result.current.startNextGame())
    // 第二局继续 ban 6 个 + pick Yasuo(step7 为蓝方 pick)
    for (let i = 0; i < 6; i++) act(() => result.current.banHero(`B${i}`))
    act(() => result.current.pickHero('Yasuo'))
    act(() => result.current.startNextGame())
    // 累计顺序 = usedThisGame 的拼接序:蓝 bans → 蓝 picks → 红 bans → 红 picks
    expect(result.current.fearlessUsed).toEqual(['Ahri', 'B0', 'B2', 'B4', 'Yasuo', 'B1', 'B3', 'B5'])
    expect(new Set(result.current.fearlessUsed).size).toBe(result.current.fearlessUsed.length)
  })

  it('reset 清空 fearlessUsed(全新系列赛)但保留开关偏好', () => {
    const { result } = renderBP()
    act(() => result.current.setFearlessEnabled(true))
    act(() => result.current.banHero('Ahri'))
    act(() => result.current.startNextGame())
    act(() => result.current.reset())
    expect(result.current.fearlessUsed).toEqual([])
    expect(result.current.fearlessEnabled).toBe(true)
  })
})
