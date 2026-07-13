import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBP } from '../../contexts/BPContext'
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

  const baseStyle = 'aspect-square rounded flex flex-col items-center justify-center transition-all duration-300'

  if (!hero) {
    return (
      <div
        className={cn(
          baseStyle,
          'border-2 border-dashed bg-slate-900/50',
          isBan ? 'border-slate-700' : (isBlue ? 'border-lol-blue/30 shadow-blue-sm' : 'border-lol-red/30 shadow-red-sm')
        )}
      >
        <span className="text-xs text-slate-700">{index + 1}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        baseStyle,
        'overflow-hidden',
        isBan
          ? 'bg-slate-800/80 border border-slate-700'
          : 'bg-slate-900/50 border-2 ' + (isBlue ? 'border-lol-blue/40 shadow-blue-sm' : 'border-lol-red/40 shadow-red-sm')
      )}
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
  const { t } = useTranslation()
  const { currentPhase, totalPhases, blueTeam, redTeam, getCurrentPhase } = useBP()

  const phase = getCurrentPhase()

  return (
    <div className="flex h-full flex-col">
      {/* 阶段指示器 */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-4 border border-slate-700/50 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-400">{t('bp.phase')}</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lol-blue to-lol-blue-glow transition-all duration-300"
                style={{ width: `${(Math.min(currentPhase + 1, totalPhases) / totalPhases) * 100}%` }}
              />
            </div>
            <span className="text-sm text-slate-400 font-mono">
              {Math.min(currentPhase + 1, totalPhases)}/{totalPhases}
            </span>
          </div>
        </div>

        {phase ? (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'relative rounded px-4 py-2 text-sm font-bold transition-all duration-200',
                'shadow-lg animate-glow',
                phase.side === 'blue'
                  ? 'bg-lol-blue text-lol-darker glow-blue'
                  : 'bg-lol-red text-white glow-red'
              )}
            >
              {t(`bp.${phase.side}Team`)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-200">{t(`bp.${phase.action}Hero`)}</span>
            </div>
            <div className="ml-auto text-xs text-slate-500 font-mono">
              {t('common.step', { step: phase.step })}
            </div>
          </div>
        ) : (
          <div className="text-sm font-medium text-green-400 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow shadow-green-500/50" />
            {t('bp.complete')}
          </div>
        )}
      </div>

      {/* BP 区域 */}
      <div className="grid flex-1 grid-cols-2 gap-8">
        {/* 蓝方 */}
        <div className={cn(
          'rounded-lg bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 border backdrop-blur-sm',
          'border-lol-blue/30 shadow-blue-sm transition-all duration-300'
        )}>
          <div className="mb-6 flex items-center gap-3">
            <div className={cn(
              'relative h-3 w-3 rounded-full',
              'bg-lol-blue animate-glow glow-blue'
            )} />
            <h3 className="text-base font-bold text-lol-blue">{t('bp.blueTeam')}</h3>
            <span className="ml-auto text-xs text-slate-500">
              {t('bp.picksCount', { count: blueTeam.picks.length })}
            </span>
          </div>

          {/* Ban 区 */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t('bp.ban')}</span>
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
              <span className="text-xs font-medium text-lol-blue uppercase tracking-wider">{t('bp.pick')}</span>
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
        <div className={cn(
          'rounded-lg bg-gradient-to-b from-slate-900/80 to-slate-900/40 p-6 border backdrop-blur-sm',
          'border-lol-red/30 shadow-red-sm transition-all duration-300'
        )}>
          <div className="mb-6 flex items-center gap-3">
            <div className={cn(
              'relative h-3 w-3 rounded-full',
              'bg-lol-red animate-glow glow-red'
            )} />
            <h3 className="text-base font-bold text-lol-red">{t('bp.redTeam')}</h3>
            <span className="ml-auto text-xs text-slate-500">
              {t('bp.picksCount', { count: redTeam.picks.length })}
            </span>
          </div>

          {/* Ban 区 */}
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t('bp.ban')}</span>
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
              <span className="text-xs font-medium text-lol-red uppercase tracking-wider">{t('bp.pick')}</span>
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
    </div>
  )
}
