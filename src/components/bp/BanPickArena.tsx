import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBP, SLOTS_PER_TEAM } from '../../contexts/BPContext'
import { useHeroes } from '../../contexts/HeroContext'
import { cn } from '../../utils/cn'

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

  // 电竞风格：更大的头像，戏剧性光照
  if (!hero) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded bg-black/40 border border-slate-800/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-mono text-slate-800/50">{index + 1}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative aspect-[4/3] overflow-hidden rounded transition-all duration-300',
        isBan ? 'bg-black/60' : 'bg-black/40',
        !isBan && (isBlue ? 'border border-lol-blue/30' : 'border border-lol-red/30'),
      )}
      title={hero.name}
    >
      {/* 背景光晕 - 电竞风格 */}
      {!isBan && (
        <div className={cn(
          'absolute inset-0 opacity-40 blur-2xl',
          isBlue ? 'bg-lol-blue/50' : 'bg-lol-red/50',
        )} />
      )}

      {/* 英雄头像 - 大尺寸 + 戏剧性光照 */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={hero.name}
          className="relative z-10 h-full w-full object-cover"
          style={{
            filter: isBan
              ? 'grayscale(100%) brightness(0.7)'
              : 'contrast(1.1) saturate(1.2)',
          }}
        />
      ) : (
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <span className="text-xl text-slate-600">{hero.name.slice(0, 2)}</span>
        </div>
      )}

      {/* 底部渐变遮罩 + 英雄名 */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent p-2">
        <p className={cn(
          'text-center text-sm font-bold tracking-wide',
          isBan ? 'text-slate-500' : (isBlue ? 'text-lol-blue' : 'text-lol-red'),
        )}>
          {hero.name}
        </p>
      </div>

      {/* Pick 状态指示器 */}
      {!isBan && (
        <div className={cn(
          'absolute right-1 top-1 z-30 h-2 w-2 rounded-full',
          'animate-pulse',
          isBlue ? 'bg-lol-blue shadow shadow-blue-lg' : 'bg-lol-red shadow shadow-red-lg',
        )} />
      )}
    </div>
  )
}

export default function BanPickArena() {
  const { t } = useTranslation()
  const { blueTeam, redTeam, getCurrentPhase } = useBP()

  const phase = getCurrentPhase()

  return (
    <div className="flex h-full flex-col bg-black">
      {/* 顶部阶段指示器 - 电竞风格 */}
      <div className="border-b border-slate-800/50 bg-black/80 px-6 py-4">
        {phase ? (
          <div className="flex items-center justify-center gap-6">
            <div
              className={cn(
                'rounded px-6 py-2 text-base font-bold',
                'shadow-lg',
                phase.side === 'blue'
                  ? 'bg-lol-blue text-lol-darker'
                  : 'bg-lol-red text-white',
              )}
            >
              {t(`bp.${phase.side}Team`)}
            </div>
            <span className="text-xl font-bold text-white">{t(`bp.${phase.action}Hero`)}</span>
            <span className="font-mono text-sm text-slate-400">{t('common.step', { step: phase.step })}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow shadow-green-500/50" />
            {t('bp.complete')}
          </div>
        )}
      </div>

      {/* BP 主区域 - 电竞风格：水平布局 + 中央红色分隔 */}
      <div className="grid flex-1 grid-cols-[1fr_auto_1fr]">
        {/* 蓝方 */}
        <div className="flex flex-col px-6 py-8">
          {/* 队名区 */}
          <div className="mb-8 flex items-center gap-4 border-b border-lol-blue/20 pb-4">
            <div className="relative h-4 w-4 rounded-full bg-lol-blue shadow-lg shadow-blue-lg" />
            <h2 className="text-2xl font-bold text-lol-blue tracking-wider">{t('bp.blueTeam')}</h2>
          </div>

          {/* Ban 区 */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-500">{t('bp.ban')}</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {blueTeam.bans.map((ban, i) => (
                <TeamSlot key={ban} heroId={ban} type="ban" side="blue" index={i} />
              ))}
              {Array.from({ length: SLOTS_PER_TEAM - blueTeam.bans.length }).map((_, i) => (
                <TeamSlot key={`empty-blue-ban-${i}`} heroId={null} type="ban" side="blue" index={blueTeam.bans.length + i} />
              ))}
            </div>
          </div>

          {/* Pick 区 */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-lol-blue">{t('bp.pick')}</span>
              <div className="flex-1 h-px bg-lol-blue/30" />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {blueTeam.picks.map((pick, i) => (
                <TeamSlot key={pick} heroId={pick} type="pick" side="blue" index={i} />
              ))}
              {Array.from({ length: SLOTS_PER_TEAM - blueTeam.picks.length }).map((_, i) => (
                <TeamSlot key={`empty-blue-pick-${i}`} heroId={null} type="pick" side="blue" index={blueTeam.picks.length + i} />
              ))}
            </div>
          </div>
        </div>

        {/* 中央红色分隔 - 电竞风格 */}
        <div className="relative flex w-16 flex-col items-center justify-center">
          <div className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-red-600 to-transparent opacity-80" />
          <div className="relative z-10 flex h-16 w-16 items-center justify-center">
            <div className="absolute h-full w-px bg-red-600" />
            <div className="absolute h-px w-full bg-red-600" />
            <div className="h-3 w-3 rounded-full bg-red-600 shadow-lg shadow-red-600/50" />
          </div>
        </div>

        {/* 红方 */}
        <div className="flex flex-col px-6 py-8">
          {/* 队名区 */}
          <div className="mb-8 flex items-center gap-4 border-b border-lol-red/20 pb-4">
            <div className="relative h-4 w-4 rounded-full bg-lol-red shadow-lg shadow-red-lg" />
            <h2 className="text-2xl font-bold text-lol-red tracking-wider">{t('bp.redTeam')}</h2>
          </div>

          {/* Ban 区 */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-500">{t('bp.ban')}</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {redTeam.bans.map((ban, i) => (
                <TeamSlot key={ban} heroId={ban} type="ban" side="red" index={i} />
              ))}
              {Array.from({ length: SLOTS_PER_TEAM - redTeam.bans.length }).map((_, i) => (
                <TeamSlot key={`empty-red-ban-${i}`} heroId={null} type="ban" side="red" index={redTeam.bans.length + i} />
              ))}
            </div>
          </div>

          {/* Pick 区 */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-lol-red">{t('bp.pick')}</span>
              <div className="flex-1 h-px bg-lol-red/30" />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {redTeam.picks.map((pick, i) => (
                <TeamSlot key={pick} heroId={pick} type="pick" side="red" index={i} />
              ))}
              {Array.from({ length: SLOTS_PER_TEAM - redTeam.picks.length }).map((_, i) => (
                <TeamSlot key={`empty-red-pick-${i}`} heroId={null} type="pick" side="red" index={redTeam.picks.length + i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
