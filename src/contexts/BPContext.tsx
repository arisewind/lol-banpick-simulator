import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// 类型定义
export type TeamSide = 'blue' | 'red'
export type ActionType = 'ban' | 'pick'

export interface HeroAction {
  step: number
  side: TeamSide
  action: ActionType
  heroId: string
  timestamp: number
}

export interface TeamState {
  bans: string[]
  picks: string[]
}

export interface BPPhase {
  step: number
  side: TeamSide
  action: ActionType
}

// 每队槽位数（ban/pick 各 5）。用于 BanPickArena 槽位计算；grid-cols-5 仍须用字面量（Tailwind JIT）
export const SLOTS_PER_TEAM = 5

// BP 阶段顺序
// 规则: A=蓝方, B=红方
// Ban: ABABAB (6) → Pick: ABBAAB (6) → Ban: BABA (4) → Pick: BAAB (4)
export const BP_PHASES: BPPhase[] = [
  // 第一阶段 Ban (6个): ABABAB
  { step: 1, side: 'blue', action: 'ban' },
  { step: 2, side: 'red', action: 'ban' },
  { step: 3, side: 'blue', action: 'ban' },
  { step: 4, side: 'red', action: 'ban' },
  { step: 5, side: 'blue', action: 'ban' },
  { step: 6, side: 'red', action: 'ban' },
  // 第一阶段 Pick (6个): ABBAAB
  { step: 7, side: 'blue', action: 'pick' },
  { step: 8, side: 'red', action: 'pick' },
  { step: 9, side: 'red', action: 'pick' },
  { step: 10, side: 'blue', action: 'pick' },
  { step: 11, side: 'blue', action: 'pick' },
  { step: 12, side: 'red', action: 'pick' },
  // 第二阶段 Ban (4个): BABA
  { step: 13, side: 'red', action: 'ban' },
  { step: 14, side: 'blue', action: 'ban' },
  { step: 15, side: 'red', action: 'ban' },
  { step: 16, side: 'blue', action: 'ban' },
  // 第二阶段 Pick (4个): BAAB
  { step: 17, side: 'red', action: 'pick' },
  { step: 18, side: 'blue', action: 'pick' },
  { step: 19, side: 'blue', action: 'pick' },
  { step: 20, side: 'red', action: 'pick' },
]

interface BPState {
  currentPhase: number
  blueTeam: TeamState
  redTeam: TeamState
  history: HeroAction[]
  isComplete: boolean
}

// BP 快照（导入导出用）：BPState 的可序列化字段集
export interface BPSnapshot {
  currentPhase: number
  blueTeam: TeamState
  redTeam: TeamState
  history: HeroAction[]
  isComplete: boolean
}

interface BPContextValue extends BPState {
  banHero: (heroId: string) => void
  pickHero: (heroId: string) => void
  undo: () => void
  reset: () => void
  loadSnapshot: (snap: BPSnapshot) => boolean
  getCurrentPhase: () => BPPhase | null
  totalPhases: number
}

const BPContext = createContext<BPContextValue | undefined>(undefined)

export function BPProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BPState>({
    currentPhase: 0,
    blueTeam: { bans: [], picks: [] },
    redTeam: { bans: [], picks: [] },
    history: [],
    isComplete: false,
  })

  const getCurrentPhase = useCallback((): BPPhase | null => {
    if (state.currentPhase >= BP_PHASES.length) return null
    return BP_PHASES[state.currentPhase]
  }, [state.currentPhase])

  // ban/pick 共用核心逻辑：校验阶段 + 重复检测 + 推进。banHero/pickHero 退化为薄包装
  const applyAction = useCallback((heroId: string, expectedAction: ActionType) => {
    setState((prev) => {
      // 检查BP是否已完成
      if (prev.currentPhase >= BP_PHASES.length) return prev

      const phase = BP_PHASES[prev.currentPhase]
      if (!phase || phase.action !== expectedAction) return prev

      // 检查英雄是否已被选择
      const allSelected = new Set([
        ...prev.blueTeam.bans,
        ...prev.redTeam.bans,
        ...prev.blueTeam.picks,
        ...prev.redTeam.picks,
      ])
      if (allSelected.has(heroId)) return prev

      const newAction: HeroAction = {
        step: phase.step,
        side: phase.side,
        action: phase.action,
        heroId,
        timestamp: Date.now(),
      }

      // 更新对应队伍的 ban/pick 列表
      const newState = { ...prev }
      if (phase.side === 'blue') {
        newState.blueTeam = expectedAction === 'ban'
          ? { ...prev.blueTeam, bans: [...prev.blueTeam.bans, heroId] }
          : { ...prev.blueTeam, picks: [...prev.blueTeam.picks, heroId] }
      } else {
        newState.redTeam = expectedAction === 'ban'
          ? { ...prev.redTeam, bans: [...prev.redTeam.bans, heroId] }
          : { ...prev.redTeam, picks: [...prev.redTeam.picks, heroId] }
      }

      newState.history = [...prev.history, newAction]
      newState.currentPhase = prev.currentPhase + 1
      newState.isComplete = prev.currentPhase + 1 >= BP_PHASES.length

      return newState
    })
  }, [])

  const banHero = useCallback((heroId: string) => applyAction(heroId, 'ban'), [applyAction])
  const pickHero = useCallback((heroId: string) => applyAction(heroId, 'pick'), [applyAction])

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.history.length === 0) return prev

      const lastAction = prev.history[prev.history.length - 1]
      const newState = { ...prev }

      // 移除最后一个操作
      if (lastAction.side === 'blue') {
        if (lastAction.action === 'ban') {
          newState.blueTeam = {
            ...prev.blueTeam,
            bans: prev.blueTeam.bans.filter(id => id !== lastAction.heroId)
          }
        } else {
          newState.blueTeam = {
            ...prev.blueTeam,
            picks: prev.blueTeam.picks.filter(id => id !== lastAction.heroId)
          }
        }
      } else {
        if (lastAction.action === 'ban') {
          newState.redTeam = {
            ...prev.redTeam,
            bans: prev.redTeam.bans.filter(id => id !== lastAction.heroId)
          }
        } else {
          newState.redTeam = {
            ...prev.redTeam,
            picks: prev.redTeam.picks.filter(id => id !== lastAction.heroId)
          }
        }
      }

      newState.history = prev.history.slice(0, -1)
      newState.currentPhase = prev.currentPhase - 1
      newState.isComplete = false

      return newState
    })
  }, [])

  const reset = useCallback(() => {
    setState({
      currentPhase: 0,
      blueTeam: { bans: [], picks: [] },
      redTeam: { bans: [], picks: [] },
      history: [],
      isComplete: false,
    })
  }, [])

  // 从快照恢复 BP 状态（导入用）。带 schema 校验 + 字段白名单，返回是否加载成功
  const loadSnapshot = useCallback((snap: BPSnapshot): boolean => {
    if (
      typeof snap?.currentPhase !== 'number' ||
      !snap?.blueTeam || !Array.isArray(snap.blueTeam.bans) || !Array.isArray(snap.blueTeam.picks) ||
      !snap?.redTeam || !Array.isArray(snap.redTeam.bans) || !Array.isArray(snap.redTeam.picks) ||
      !Array.isArray(snap?.history) ||
      typeof snap?.isComplete !== 'boolean'
    ) {
      return false
    }
    setState({
      currentPhase: snap.currentPhase,
      blueTeam: { bans: [...snap.blueTeam.bans], picks: [...snap.blueTeam.picks] },
      redTeam: { bans: [...snap.redTeam.bans], picks: [...snap.redTeam.picks] },
      history: [...snap.history],
      isComplete: snap.isComplete,
    })
    return true
  }, [])

  const value: BPContextValue = {
    ...state,
    banHero,
    pickHero,
    undo,
    reset,
    loadSnapshot,
    getCurrentPhase,
    totalPhases: BP_PHASES.length,
  }

  return <BPContext.Provider value={value}>{children}</BPContext.Provider>
}

export function useBP() {
  const context = useContext(BPContext)
  if (context === undefined) {
    throw new Error('useBP must be used within a BPProvider')
  }
  return context
}

export default BPProvider
