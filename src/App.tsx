import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BPProvider as BPContext } from './contexts/BPContext'
import { HeroProvider as HeroContext } from './contexts/HeroContext'
import { DataProvider as DataContext } from './contexts/DataContext'
import BanPickArena from './components/bp/BanPickArena'
import AnalysisDrawer from './components/analysis/AnalysisDrawer'
import { useBP } from './contexts/BPContext'
import { isValidBPSnapshotRenderer } from './utils/typeGuards'

// 环境检测组件
function EnvironmentGuard({ children }: { children: React.ReactNode }) {
  const [isElectron, setIsElectron] = useState(false)
  const [isBrowserDev, setIsBrowserDev] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // 检测是否在 Electron 环境中(已由 preload 注入 electronAPI)
    const hasElectronAPI = typeof window !== 'undefined' && window.electronAPI
    if (hasElectronAPI) {
      setIsElectron(true)
      setChecked(true)
      return
    }

    // 非 Electron:DEV 模式下注入浏览器 mock,放行预览;生产模式拦住
    if (import.meta.env.DEV) {
      // 动态导入,生产构建被 tree-shake 掉,不含 mock 代码
      import('./dev/devMock')
        .then(({ setupDevMock }) => setupDevMock())
        .then(() => {
          setIsBrowserDev(true)
          setChecked(true)
        })
        .catch(() => {
          setChecked(true)
        })
    } else {
      setChecked(true)
    }
  }, [])

  if (!checked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-lol-bg-dark">
        <div className="text-lol-text-secondary">检测运行环境...</div>
      </div>
    )
  }

  // 生产模式且非 Electron:拦截,提示正确启动方式
  if (!isElectron && !isBrowserDev) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-lol-bg-dark">
        <div className="max-w-md rounded border-2 border-lol-red bg-lol-bg-secondary p-8 shadow-hard">
          <h1 className="mb-4 text-2xl font-bold text-lol-red">⚠️ 运行环境错误</h1>
          <p className="mb-4 text-lol-text-secondary">
            此应用必须在 Electron 环境中运行，不能直接在浏览器中打开。
          </p>
          <div className="rounded bg-lol-bg-black p-4">
            <p className="mb-2 text-sm font-bold text-lol-text-primary">正确的启动方式：</p>
            <code className="block rounded bg-lol-bg-secondary p-2 text-sm text-lol-gold">
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

  // DEV 浏览器预览模式:放行,但顶部显示提示条(导出/导入等文件操作不可用)
  return (
    <>
      {isBrowserDev && (
        <div className="fixed left-1/2 top-2 z-[60] -translate-x-1/2 rounded border border-lol-gold/40 bg-lol-bg-secondary/95 px-3 py-1 text-xs text-lol-gold shadow-hard">
          浏览器预览模式(DEV mock) · 导出/导入不可用 · 完整功能请用 pnpm electron:dev
        </div>
      )}
      {children}
    </>
  )
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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-lol-bg-dark text-lol-text-primary">
      {notice && (
        <div className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded px-4 py-2 text-sm text-white shadow-hard ${
          notice.type === 'success' ? 'bg-lol-blue text-black' : 'bg-lol-red'
        }`}>
          {notice.text}
        </div>
      )}

      {/* Header - C 风格:简洁(原型 A 样式),标题/进度用 display 字体,金色强调 */}
      <header className="relative flex h-16 shrink-0 items-center gap-4 border-b border-lol-border bg-lol-bg-secondary px-4">
        {/* 左:标题(display 字体) */}
        <h1 className="shrink-0 font-display text-lg font-bold uppercase tracking-wider text-lol-text-primary">
          {t('app.title')}
        </h1>

        {/* 中:当前阶段信息 + 进度计数 */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
          <span className="font-display text-xs text-lol-text-secondary">
            {Math.min(currentPhase + 1, totalPhases)}/{totalPhases}
          </span>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-lol-bg-card">
            <div
              className="h-full rounded-full bg-lol-gold transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 右:功能按钮组(原 Header + Footer 所有按钮集中于此) */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* 语言切换 */}
          <div className="flex items-center gap-0.5">
            {(['zh-CN', 'zh-TW', 'en'] as const).map(lng => (
              <button
                key={lng}
                onClick={() => i18n.changeLanguage(lng)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  i18n.language === lng
                    ? 'bg-lol-blue text-black'
                    : 'text-lol-text-muted hover:text-lol-text-secondary'
                }`}
              >
                {lng === 'zh-CN' ? '简中' : lng === 'zh-TW' ? '繁中' : 'EN'}
              </button>
            ))}
          </div>
          <div className="mx-1 h-5 w-px bg-lol-border" />
          <button
            onClick={undo}
            disabled={currentPhase === 0}
            className="btn-game rounded bg-lol-bg-secondary px-3 py-1.5 text-xs text-white shadow-hard uppercase tracking-wide hover:bg-lol-bg-card hover:shadow-hard-hover disabled:cursor-not-allowed disabled:bg-black disabled:text-lol-bg-secondary disabled:shadow-none"
          >
            {t('common.undo')}
          </button>
          <button
            onClick={reset}
            className="btn-game rounded bg-lol-bg-secondary px-3 py-1.5 text-xs text-white shadow-hard uppercase tracking-wide hover:bg-lol-bg-card hover:shadow-hard-hover"
          >
            {t('common.reset')}
          </button>
          <div className="mx-1 h-5 w-px bg-lol-border" />
          <button
            onClick={() => setAnalysisOpen(true)}
            className="btn-game rounded bg-lol-blue/20 px-3 py-1.5 text-xs font-medium text-lol-blue uppercase tracking-wide transition-colors hover:bg-lol-blue/30"
          >
            {t('analysis.open')}
          </button>
          <button
            onClick={handleExport}
            className="btn-game rounded bg-lol-bg-secondary px-3 py-1.5 text-xs text-white shadow-hard uppercase tracking-wide hover:bg-lol-bg-card hover:shadow-hard-hover"
          >
            {t('common.export')}
          </button>
          <button
            onClick={handleImport}
            className="btn-game rounded bg-lol-bg-secondary px-3 py-1.5 text-xs text-white shadow-hard uppercase tracking-wide hover:bg-lol-bg-card hover:shadow-hard-hover"
          >
            {t('common.import')}
          </button>
        </div>

        {/* 底部进度线(C 风格:金色) */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-lol-bg-card">
          <div
            className="h-full bg-lol-gold transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* Main:三列横向铺满(蓝|英雄选择|红),整页固定一屏,仅英雄网格内部滚动 */}
      <main className="flex-1 overflow-hidden">
        <BanPickArena />
      </main>

      {/* 分析抽屉(默认收起,独立浮层不影响主布局) */}
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
