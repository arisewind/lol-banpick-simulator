import BPContext from './contexts/BPContext'
import HeroContext from './contexts/HeroContext'
import DataContext from './contexts/DataContext'
import BanPickArena from './components/bp/BanPickArena'
import HeroGrid from './components/bp/HeroGrid'
import AnalysisPanel from './components/analysis/AnalysisPanel'
import { useBP } from './contexts/BPContext'

function AppContent() {
  const { undo, reset, currentPhase } = useBP()

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50">
        <div className="flex h-full items-center justify-between px-6">
          <h1 className="text-xl font-bold text-slate-100">
            英雄联盟 BP 模拟器
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">英雄数据模块完成</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-8rem)]">
        {/* Hero Grid */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/30 p-4">
          <HeroGrid />
        </div>

        {/* BP Arena */}
        <div className="flex-1 p-6">
          <BanPickArena />
        </div>

        {/* Analysis Panel */}
        <div className="w-96 border-l border-slate-800 bg-slate-900/30 p-4">
          <AnalysisPanel />
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-slate-800 bg-slate-900/50">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={currentPhase === 0}
              className="rounded bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              撤销
            </button>
            <button
              onClick={reset}
              className="rounded bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600"
            >
              重置
            </button>
          </div>
          <div className="flex gap-2">
            <button className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700">
              导出
            </button>
            <button className="rounded bg-green-600 px-4 py-2 text-sm hover:bg-green-700">
              导入
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <HeroContext>
      <BPContext>
        <DataContext>
          <AppContent />
        </DataContext>
      </BPContext>
    </HeroContext>
  )
}

export default App
