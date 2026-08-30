import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'
import { usePhaseTimer } from '../../hooks/usePhaseTimer'
import type { BPPhase } from '../../contexts/BPContext'

interface PhaseTimerProps {
  phase: BPPhase | null
}

/**
 * 阶段倒计时(学 DraftLoL):显示当前 ban/pick 步的剩余时间。
 * - ≤10 秒进入紧急态:红色 + 脉冲
 * - 点击暂停/继续(模拟器不强制超时,保留手动操作权)
 * - 无当前阶段(BP 结束)时不渲染
 */
export default function PhaseTimer({ phase }: PhaseTimerProps) {
  const { t } = useTranslation()
  const { secondsLeft, paused, togglePaused } = usePhaseTimer(phase)

  if (!phase) return null

  const isUrgent = secondsLeft <= 10
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <button
      type="button"
      onClick={togglePaused}
      aria-label={paused ? t('bp.timerResume') : t('bp.timerPause')}
      title={paused ? t('bp.timerResume') : t('bp.timerPause')}
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded border px-2 py-1',
        'font-mono text-xs font-bold transition-all duration-150',
        // 暂停:灰色静默态;紧急(≤10s):红色脉冲;常规:金色
        paused
          ? 'border-lol-border bg-lol-bg-card text-lol-text-muted'
          : isUrgent
            ? 'animate-pulse border-lol-red/70 bg-lol-red/15 text-lol-red'
            : 'border-lol-border bg-lol-bg-card text-lol-gold',
      )}
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5" strokeLinecap="round" />
        <path d="M9 2h6" strokeLinecap="round" />
      </svg>
      <span>
        {minutes}:{String(seconds).padStart(2, '0')}
      </span>
      {paused && <span className="text-[10px] font-medium">{t('bp.timerPaused')}</span>}
    </button>
  )
}
