import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'
import AnalysisPanel from './AnalysisPanel'

interface AnalysisDrawerProps {
  open: boolean
  onClose: () => void
}

// 右侧可折叠分析抽屉：默认收起（translate-x-full），开关后滑入（translate-x-0）。
// 遮罩 z-30 < 抽屉 z-40 < notice z-50，点遮罩 / 关闭按钮 / Esc 关闭。
export default function AnalysisDrawer({ open, onClose }: AnalysisDrawerProps) {
  const { t } = useTranslation()

  // Esc 关闭
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <>
      {/* 遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}
      {/* 抽屉本体 - pickban.pro 风格:纯黑底 + 硬阴影,无 slate-* 混用 */}
      <aside
        className={cn(
          'fixed top-0 right-0 z-40 h-full w-96',
          'flex flex-col border-l border-lol-border bg-lol-bg-dark/95 shadow-hard',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-label={t('analysis.toggle')}
      >
        <div className="flex items-center justify-between border-b border-lol-border px-4 py-3">
          <h2 className="text-sm font-bold text-lol-text-primary uppercase tracking-wide">{t('analysis.title')}</h2>
          <button
            onClick={onClose}
            className="btn-game rounded px-2 py-1 text-xs text-lol-text-muted transition-colors hover:text-lol-text-secondary"
            aria-label={t('analysis.close')}
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <AnalysisPanel />
        </div>
      </aside>
    </>
  )
}
