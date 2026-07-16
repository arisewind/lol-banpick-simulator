import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'
import type { BPPhase } from '../../contexts/BPContext'

interface PhaseIndicatorProps {
  phase: BPPhase | null
}

/**
 * 顶部阶段指示器
 * - 有阶段时：显示队伍色块 + 当前动作 + 步骤序号
 * - 无阶段时：显示 BP 完成状态
 */
function PhaseIndicator({ phase }: PhaseIndicatorProps) {
  const { t } = useTranslation()

  if (!phase) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-400">
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow shadow-green-500/50" />
        {t('bp.complete')}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-6">
      <div
        className={cn(
          'rounded px-6 py-2 text-base font-bold',
          'shadow-lg',
          phase.side === 'blue'
            ? 'bg-lol-blue text-white'
            : 'bg-lol-red text-white',
        )}
      >
        {t(`bp.${phase.side}Team`)}
      </div>
      <span className="text-xl font-bold text-white">{t(`bp.${phase.action}Hero`)}</span>
      <span className="font-mono text-sm text-lol-text-secondary">{t('common.step', { step: phase.step })}</span>
    </div>
  )
}

export default PhaseIndicator
