/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePhaseTimer, PHASE_TIME_SECONDS } from '../usePhaseTimer'
import type { BPPhase } from '../../contexts/BPContext'

// Hook 测试:jsdom + 假计时器,验证换步重置/走秒/暂停
const banPhase: BPPhase = { step: 1, side: 'blue', action: 'ban' }
const pickPhase: BPPhase = { step: 7, side: 'blue', action: 'pick' }

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('usePhaseTimer 初始与换步', () => {
  it('时限为 ban 30s / pick 30s', () => {
    expect(PHASE_TIME_SECONDS.ban).toBe(30)
    expect(PHASE_TIME_SECONDS.pick).toBe(30)
  })

  it('无 phase 时 secondsLeft 为 0', () => {
    const { result } = renderHook(() => usePhaseTimer(null))
    expect(result.current.secondsLeft).toBe(0)
    expect(result.current.totalSeconds).toBe(0)
  })

  it('按当前阶段动作初始化时限', () => {
    const { result } = renderHook(() => usePhaseTimer(pickPhase))
    expect(result.current.secondsLeft).toBe(30)
    expect(result.current.totalSeconds).toBe(30)
  })

  it('phase 变化(换步)时重置为新时限并恢复走时', () => {
    const { result, rerender } = renderHook(({ phase }: { phase: BPPhase | null }) => usePhaseTimer(phase), {
      initialProps: { phase: banPhase as BPPhase | null },
    })
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.secondsLeft).toBe(25)
    // 换步到 pick
    rerender({ phase: pickPhase })
    expect(result.current.secondsLeft).toBe(30)
    // BP 结束(phase 为 null)归零
    rerender({ phase: null })
    expect(result.current.secondsLeft).toBe(0)
  })
})

describe('usePhaseTimer 走秒与暂停', () => {
  it('每秒递减,到 0 停住不为负', () => {
    const { result } = renderHook(() => usePhaseTimer(banPhase))
    act(() => {
      vi.advanceTimersByTime(29_000)
    })
    expect(result.current.secondsLeft).toBe(1)
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    expect(result.current.secondsLeft).toBe(0)
  })

  it('togglePaused 暂停/恢复走时', () => {
    const { result } = renderHook(() => usePhaseTimer(banPhase))
    act(() => result.current.togglePaused())
    expect(result.current.paused).toBe(true)
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    expect(result.current.secondsLeft).toBe(30)
    act(() => result.current.togglePaused())
    expect(result.current.paused).toBe(false)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.secondsLeft).toBe(28)
  })

  it('换步时自动解除暂停', () => {
    const { result, rerender } = renderHook(({ phase }: { phase: BPPhase | null }) => usePhaseTimer(phase), {
      initialProps: { phase: banPhase as BPPhase | null },
    })
    act(() => result.current.togglePaused())
    expect(result.current.paused).toBe(true)
    rerender({ phase: pickPhase })
    expect(result.current.paused).toBe(false)
  })
})
