import { useState, useEffect } from 'react'
import { useBP } from '../../contexts/BPContext'
import { useHeroes } from '../../contexts/HeroContext'

interface TeamSlotProps {
  heroId: string | null
  type: 'ban' | 'pick'
  side: 'blue' | 'red'
  index: number
}

function TeamSlot({ heroId, type, side, index }: TeamSlotProps) {
  const { getHeroById } = useHeroes()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const hero = heroId ? getHeroById(heroId) : null

  useEffect(() => {
    if (!hero) return

    let mounted = true

    const fetchImageUrl = async () => {
      try {
        const result = await window.electronAPI.getHeroImageUrl(hero.id)
        if (mounted && result.success && result.data) {
          setImageUrl(result.data)
        }
      } catch (error) {
        // Ignore image loading errors
      }
    }

    fetchImageUrl()

    return () => {
      mounted = false
    }
  }, [hero])

  const isBan = type === 'ban'
  const isBlue = side === 'blue'

  const baseStyle = 'aspect-square rounded flex flex-col items-center justify-center transition-all duration-300'

  if (!hero) {
    return (
      <div
        className={`${baseStyle} border-2 border-dashed ${
          isBan
            ? 'border-slate-700 bg-slate-900/50'
            : `border-${isBlue ? 'lol-blue' : 'lol-red'}/30 bg-slate-900/50`
        }`}
      >
        <span className="text-xs text-slate-700">{index + 1}</span>
      </div>
    )
  }

  return (
    <div
      className={`${baseStyle} ${
        isBan
          ? 'bg-slate-800/80 border border-slate-700'
          : `bg-${isBlue ? 'lol-blue' : 'lol-red'}/10 border border-${isBlue ? 'lol-blue' : 'lol-red'}/30`
      } overflow-hidden`}
      title={hero.name}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={hero.name} className="h-12 w-12 object-contain" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center">
          <span className="text-xs text-slate-500">{hero.name.slice(0, 2)}</span>
        </div>
      )}
      <span className={`mt-1 text-xs font-medium truncate w-full text-center px-1 ${
        isBan ? 'text-slate-400' : isBlue ? 'text-lol-blue' : 'text-lol-red'
      }`}>
        {hero.name}
      </span>
    </div>
  )
}

export default function BanPickArena() {
  const { currentPhase, blueTeam, redTeam, getCurrentPhase, undo, reset } = useBP()

  const phase = getCurrentPhase()

  return (
    <div className="flex h-full flex-col">
      {/* 阶段指示器 */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-slate-900/50 to-slate-800/50 p-4 border border-slate-700/50">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-400">当前阶段</span>
          <span className="text-sm text-slate-500">
            {currentPhase + 1}/20
          </span>
        </div>

        {phase ? (
          <div className="flex items-center gap-3">
            <div
              className={`rounded px-4 py-2 text-sm font-bold transition-all ${
                phase.side === 'blue'
                  ? 'bg-lol-blue text-lol-darker shadow-lg shadow-blue-900/20'
                  : 'bg-lol-red text-white shadow-lg shadow-red-900/20'
              }`}
            >
              {phase.side === 'blue' ? '蓝方' : '红方'}
            </div>
            <div className="text-sm text-slate-300">
              {phase.action === 'ban' ? '禁用英雄' : '选择英雄'}
            </div>
            <div className="ml-auto text-xs text-slate-500">
              第 {phase.step} 步
            </div>
          </div>
        ) : (
          <div className="text-sm font-medium text-green-400 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            BP 流程已完成
          </div>
        )}
      </div>

      {/* BP 区域 */}
      <div className="grid flex-1 grid-cols-2 gap-8">
        {/* 蓝方 */}
        <div className="rounded-lg bg-gradient-to-b from-slate-900/50 to-slate-900/30 p-6 border border-lol-blue/20">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-lol-blue shadow-lg shadow-blue-500/50" />
            <h3 className="text-base font-bold text-lol-blue">蓝方</h3>
            <span className="ml-auto text-xs text-slate-500">
              {blueTeam.picks.length}/5 已选择
            </span>
          </div>

          {/* Ban 区 */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">禁用</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {blueTeam.bans.map((ban, i) => (
                <TeamSlot key={ban} heroId={ban} type="ban" side="blue" index={i} />
              ))}
              {Array.from({ length: 5 - blueTeam.bans.length }).map((_, i) => (
                <TeamSlot key={`empty-blue-ban-${i}`} heroId={null} type="ban" side="blue" index={blueTeam.bans.length + i} />
              ))}
            </div>
          </div>

          {/* Pick 区 */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-medium text-lol-blue uppercase tracking-wider">选择</span>
              <div className="flex-1 h-px bg-lol-blue/20" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {blueTeam.picks.map((pick, i) => (
                <TeamSlot key={pick} heroId={pick} type="pick" side="blue" index={i} />
              ))}
              {Array.from({ length: 5 - blueTeam.picks.length }).map((_, i) => (
                <TeamSlot key={`empty-blue-pick-${i}`} heroId={null} type="pick" side="blue" index={blueTeam.picks.length + i} />
              ))}
            </div>
          </div>
        </div>

        {/* 红方 */}
        <div className="rounded-lg bg-gradient-to-b from-slate-900/50 to-slate-900/30 p-6 border border-lol-red/20">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-lol-red shadow-lg shadow-red-500/50" />
            <h3 className="text-base font-bold text-lol-red">红方</h3>
            <span className="ml-auto text-xs text-slate-500">
              {redTeam.picks.length}/5 已选择
            </span>
          </div>

          {/* Ban 区 */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">禁用</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {redTeam.bans.map((ban, i) => (
                <TeamSlot key={ban} heroId={ban} type="ban" side="red" index={i} />
              ))}
              {Array.from({ length: 5 - redTeam.bans.length }).map((_, i) => (
                <TeamSlot key={`empty-red-ban-${i}`} heroId={null} type="ban" side="red" index={redTeam.bans.length + i} />
              ))}
            </div>
          </div>

          {/* Pick 区 */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-medium text-lol-red uppercase tracking-wider">选择</span>
              <div className="flex-1 h-px bg-lol-red/20" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {redTeam.picks.map((pick, i) => (
                <TeamSlot key={pick} heroId={pick} type="pick" side="red" index={i} />
              ))}
              {Array.from({ length: 5 - redTeam.picks.length }).map((_, i) => (
                <TeamSlot key={`empty-red-pick-${i}`} heroId={null} type="pick" side="red" index={redTeam.picks.length + i} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={undo}
          disabled={currentPhase === 0}
          className="rounded bg-slate-700 px-6 py-2.5 text-sm font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          撤销
        </button>
        <button
          onClick={reset}
          className="rounded bg-slate-700 px-6 py-2.5 text-sm font-medium hover:bg-slate-600 transition-all shadow-lg"
        >
          重置
        </button>
      </div>
    </div>
  )
}
