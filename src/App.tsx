import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BPProvider as BPContext } from './contexts/BPContext'
import { HeroProvider as HeroContext } from './contexts/HeroContext'
import { DataProvider as DataContext } from './contexts/DataContext'
import BanPickArena from './components/bp/BanPickArena'
import HeroGrid from './components/bp/HeroGrid'
import AnalysisDrawer from './components/analysis/AnalysisDrawer'
import { useBP } from './contexts/BPContext'
import { isValidBPSnapshotRenderer } from './utils/typeGuards'

// 环境检测组件
function EnvironmentGuard({ children }: { children: React.ReactNode }) {
  const [isElectron, setIsElectron] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // 检测是否在 Electron 环境中
    const hasElectronAPI = typeof window !== 'undefined' && window.electronAPI
    setIsElectron(!!hasElectronAPI)
    setChecked(true)
  }, [])

  if (!checked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-lol-bg-black">
        <div className="text-lol-text-secondary">检测运行环境...</div>
      </div>
    )
  }

  if (!isElectron) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-lol-bg-black">
        <div className="max-w-md rounded-lg border-2 border-lol-red bg-lol-bg-dark p-8 shadow-xl shadow-red-lg">
          <h1 className="mb-4 text-2xl font-bold text-lol-red">⚠️ 运行环境错误</h1>
          <p className="mb-4 text-lol-text-secondary">
            此应用必须在 Electron 环境中运行，不能直接在浏览器中打开。
          </p>
          <div className="rounded-lg bg-lol-bg-black p-4">
            <p className="mb-2 text-sm font-bold text-lol-text-primary">正确的启动方式：</p>
            <code className="block rounded bg-lol-bg-dark p-2 text-sm text-lol-gold">
              pnpm electron:dev
            </code>
            <p className="mt-3 text-xs text-lol-text-muted">
              或双击项目根目录下的 <span className="text-lol-blue">启动开发环境.bat</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function AppContent() {
  const { t, i18n } = useTranslation()
  const { undo, reset, currentPhase, totalPhases, blueTeam, redTeam, history, isComplete, loadSnapshot } = useBP()
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  // notice 自动 3 秒后消失
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(timer)
  }, [notice])

  const handleExport = async () => {
    const result = await window.electronAPI.exportData({
      currentPhase,
      blueTeam,
      redTeam,
      history,
      isComplete,
      exportedAt: Date.now(),
    })
    if (result.success) {
      setNotice({ text: t('common.exportSuccess'), type: 'success' })
    } else if (!('canceled' in result)) {
      setNotice({ text: result.error, type: 'error' })
    }
  }

  const handleImport = async () => {
    const result = await window.electronAPI.importData()
    if (result.success && result.data) {
      // 运行时类型检查：确保数据格式正确
      if (!isValidBPSnapshotRenderer(result.data)) {
        setNotice({ text: t('common.importInvalid'), type: 'error' })
        return
      }
      const ok = loadSnapshot(result.data)
      setNotice(
        ok
          ? { text: t('common.importSuccess'), type: 'success' }
          : { text: t('common.importInvalid'), type: 'error' },
      )
    } else if (!result.success && !('canceled' in result)) {
      setNotice({ text: result.error, type: 'error' })
    }
  }

  const progressPct = (Math.min(currentPhase + 1, totalPhases) / totalPhases) * 100

  return (
    <div className="h-screen w-screen bg-lol-bg-dark text-lol-text-primary">
      {notice && (
        <div className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-lg px-4 py-2 text-sm text-white shadow-lg ${
          notice.type === 'success' ? 'bg-green-600' : 'bg-lol-red'
        }`}>
          {notice.text}
        </div>
      )}

      {/* Header - 电竞风格 */}
      <header className="flex h-16 items-center justify-between border-b border-lol-border glass-esports px-6">
        <h1 className="text-xl font-bold text-lol-text-primary">{t('app.title')}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {(['zh-CN', 'zh-TW', 'en'] as const).map(lng => (
              <button
                key={lng}
                onClick={() => i18n.changeLanguage(lng)}
                className={`rounded px-2 py-1 text-xs font-medium ${
                  i18n.language === lng
                    ? 'bg-lol-blue text-white'
                    : 'text-lol-text-muted hover:text-lol-text-secondary'
                }`}
              >
                {lng === 'zh-CN' ? '简中' : lng === 'zh-TW' ? '繁中' : 'EN'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAnalysisOpen(true)}
            className="btn-game rounded bg-lol-blue/20 px-3 py-1.5 text-xs font-medium text-lol-blue transition-colors hover:bg-lol-blue/30"
          >
            {t('analysis.open')}
          </button>
          <span className="text-sm text-lol-text-secondary">{t('app.status')}</span>
        </div>
      </header>

      {/* Main: 上下分区（顶部英雄池 / 中部 ban+pick 竞技场） */}
      <main className="flex h-[calc(100vh-8rem)] flex-col">
        <section className="h-[32vh] overflow-hidden border-b border-lol-border bg-lol-bg-dark/60 px-6 py-3">
          <HeroGrid />
        </section>
        <section className="flex-1 overflow-hidden px-6 py-4">
          <BanPickArena />
        </section>
      </main>

      {/* Footer - 电竞风格 */}
      <footer className="flex h-16 items-center justify-between border-t border-lol-border glass-esports px-6">
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={currentPhase === 0}
            className="rounded-lg bg-lol-bg-dark px-4 py-2 text-sm hover:bg-lol-border disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('common.undo')}
          </button>
          <button
            onClick={reset}
            className="rounded-lg bg-lol-bg-dark px-4 py-2 text-sm hover:bg-lol-border"
          >
            {t('common.reset')}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-40 overflow-hidden rounded-full bg-lol-bg-black">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lol-blue to-lol-blue-light shadow-blue-sm transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono text-xs text-lol-text-secondary">
            {Math.min(currentPhase + 1, totalPhases)}/{totalPhases}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
          >
            {t('common.export')}
          </button>
          <button
            onClick={handleImport}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm hover:bg-green-700"
          >
            {t('common.import')}
          </button>
        </div>
      </footer>

      {/* 分析抽屉（默认收起） */}
      <AnalysisDrawer open={analysisOpen} onClose={() => setAnalysisOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <EnvironmentGuard>
      <HeroContext>
        <BPContext>
          <DataContext>
            <AppContent />
          </DataContext>
        </BPContext>
      </HeroContext>
    </EnvironmentGuard>
  )
}

export default App
