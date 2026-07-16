/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PhaseIndicator from '../PhaseIndicator'
import type { BPPhase } from '../../../contexts/BPContext'

// 组件测试：mock i18n，聚焦渲染分支
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, opts?: { step?: number }) => opts?.step != null ? `${k}:${opts.step}` : k }),
}))

describe('PhaseIndicator - 渲染分支', () => {
  it('phase 为 null 时显示完成状态', () => {
    render(<PhaseIndicator phase={null} />)
    expect(screen.getByText('bp.complete')).toBeTruthy()
  })

  it('蓝方 ban 阶段显示蓝队 + ban 动作 + 步骤', () => {
    const phase: BPPhase = { step: 1, side: 'blue', action: 'ban' }
    render(<PhaseIndicator phase={phase} />)
    expect(screen.getByText('bp.blueTeam')).toBeTruthy()
    expect(screen.getByText('bp.banHero')).toBeTruthy()
    expect(screen.getByText('common.step:1')).toBeTruthy()
  })

  it('红方 pick 阶段显示红队 + pick 动作', () => {
    const phase: BPPhase = { step: 7, side: 'red', action: 'pick' }
    render(<PhaseIndicator phase={phase} />)
    expect(screen.getByText('bp.redTeam')).toBeTruthy()
    expect(screen.getByText('bp.pickHero')).toBeTruthy()
    expect(screen.getByText('common.step:7')).toBeTruthy()
  })

  it('蓝方阶段应用蓝色背景类', () => {
    const phase: BPPhase = { step: 1, side: 'blue', action: 'ban' }
    const { container } = render(<PhaseIndicator phase={phase} />)
    const colorBlock = container.querySelector('.bg-lol-blue')
    expect(colorBlock).toBeTruthy()
  })

  it('红方阶段应用红色背景类', () => {
    const phase: BPPhase = { step: 2, side: 'red', action: 'ban' }
    const { container } = render(<PhaseIndicator phase={phase} />)
    const colorBlock = container.querySelector('.bg-lol-red')
    expect(colorBlock).toBeTruthy()
  })
})
