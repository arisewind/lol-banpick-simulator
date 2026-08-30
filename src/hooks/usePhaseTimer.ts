import { useState, useEffect, useCallback } from 'react'
import type { BPPhase } from '../contexts/BPContext'

/**
 * 每步操作限时(秒)。对齐职业赛场 BP 节奏:ban 30 秒 / pick 30 秒,
 * 与 DraftLoL 等成熟模拟器的默认时限一致。
 */
export const PHASE_TIME_SECONDS: Record<BPPhase['action'], number> = {
  ban: 30,
  pick: 30,
}

/**
 * 阶段倒计时 Hook(学 DraftLoL:每步 ban/pick 带倒计时,营造实战压迫感)
 *
 * - 换步(BP 推进/撤销/重置/下一局,表现为 phase 引用变化)时重置为该步满额时限并恢复走时
 * - 走到 0 停住(不自动选人:模拟器保留手动操作权,超时状态由 UI 层提示)
 * - paused 仅暂停走时,换步时自动恢复
 */
export function usePhaseTimer(phase: BPPhase | null) {
  const [secondsLeft, setSecondsLeft] = useState(() => (phase ? PHASE_TIME_SECONDS[phase.action] : 0))
  const [paused, setPaused] = useState(false)

  // 换步重置:phase 引用来自 BP_PHASES 常量数组,仅 currentPhase 变化时才换引用
  useEffect(() => {
    setSecondsLeft(phase ? PHASE_TIME_SECONDS[phase.action] : 0)
    setPaused(false)
  }, [phase])

  useEffect(() => {
    if (!phase || paused) return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase, paused])

  const togglePaused = useCallback(() => setPaused((p) => !p), [])

  return {
    secondsLeft,
    totalSeconds: phase ? PHASE_TIME_SECONDS[phase.action] : 0,
    paused,
    togglePaused,
  }
}
