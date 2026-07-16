import { useBP } from '../../contexts/BPContext'
import PhaseIndicator from './PhaseIndicator'
import TeamSection from './TeamSection'

/**
 * BP 主竞技场
 * 组合 PhaseIndicator（顶部阶段）+ TeamSection（蓝/红双方面板）+ 中央分隔
 */
export default function BanPickArena() {
  const { blueTeam, redTeam, getCurrentPhase } = useBP()
  const phase = getCurrentPhase()

  return (
    <div className="flex h-full flex-col bg-black">
      {/* 顶部阶段指示器 - 电竞风格 */}
      <div className="border-b border-lol-border/50 bg-black/80 px-6 py-4">
        <PhaseIndicator phase={phase} />
      </div>

      {/* BP 主区域 - 电竞风格：水平布局 + 中央紫色分隔 */}
      <div className="grid flex-1 grid-cols-[1fr_auto_1fr]">
        {/* 蓝方 */}
        <TeamSection side="blue" team={blueTeam} />

        {/* 中央紫色分隔 - 电竞风格 */}
        <div className="relative flex w-20 flex-col items-center justify-center">
          <div className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-lol-purple to-transparent shadow-purple-lg" />
          <div className="relative z-10 flex h-20 w-20 items-center justify-center">
            <div className="absolute h-full w-px bg-lol-purple" />
            <div className="absolute h-px w-full bg-lol-purple" />
            <div className="h-4 w-4 rounded-full bg-lol-purple shadow-xl shadow-purple-lg animate-pulse" />
          </div>
        </div>

        {/* 红方 */}
        <TeamSection side="red" team={redTeam} />
      </div>
    </div>
  )
}
