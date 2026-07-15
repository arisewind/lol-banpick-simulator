import { useTranslation } from 'react-i18next'
import { useBP, SLOTS_PER_TEAM } from '../../contexts/BPContext'
import { useHeroes } from '../../contexts/HeroContext'
import { cn } from '../../utils/cn'
import { useHeroImage } from '../../hooks/useHeroImage'

interface TeamSlotProps {
  heroId: string | null
  type: 'ban' | 'pick'
  side: 'blue' | 'red'
  index: number
}

function TeamSlot({ heroId, type, side, index }: TeamSlotProps) {
  const { getHeroById } = useHeroes()
  const hero = heroId ? getHeroById(heroId) : null
  const { imageUrl } = useHeroImage(hero?.id)

  const isBan = type === 'ban'
  const isBlue = side === 'blue'

  // 电竞风格：更大的头像，戏剧性光照，增强边框和发光
  if (!hero) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black/40 border border-slate-800/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-mono text-slate-700/60">{index + 1}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative aspect-[4/3] overflow-hidden rounded-lg transition-all duration-300',
        'border-2',
        isBan ? 'bg-black/60 border-slate-700' : 'bg-black/40',
        !isBan && (isBlue ? 'border-lol-blue shadow-blue' : 'border-lol-red shadow-red'),
      )}
      title={hero.name}
    >
      {/* 背景光晕 - 电竞风格增强 */}
      {!isBan && (
        <div className={cn(
          'absolute inset-0 opacity-60 blur-3xl',
          isBlue ? 'bg-lol-blue' : 'bg-lol-red',
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

      {/* Pick 状态指示器 - 电竞风格增强 */}
      {!isBan && (
        <div className={cn(
          'absolute right-2 top-2 z-30 h-2.5 w-2.5 rounded-full',
          'animate-pulse',
          isBlue ? 'bg-lol-blue shadow-blue-lg' : 'bg-lol-red shadow-red-lg',
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
                  ? 'bg-lol-blue text-white'
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
          {/* 队名区 - 电竞风格 */}
          <div className="mb-10 flex items-center gap-4 border-b border-lol-blue/30 pb-6">
            <div className="relative h-5 w-5 rounded-full bg-lol-blue shadow-xl shadow-blue-lg animate-pulse" />
            <h2 className="text-4xl font-extrabold text-lol-blue tracking-wider">{t('bp.blueTeam')}</h2>
          </div>

          {/* Ban 区 */}
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-lol-text-secondary">{t('bp.ban')}</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>
            <div className="grid grid-cols-5 gap-5">
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
            <div className="mb-5 flex items-center gap-3">
              <span className="text-base font-bold uppercase tracking-widest text-lol-blue">{t('bp.pick')}</span>
              <div className="flex-1 h-px bg-lol-blue/40" />
            </div>
            <div className="grid grid-cols-5 gap-5">
              {blueTeam.picks.map((pick, i) => (
                <TeamSlot key={pick} heroId={pick} type="pick" side="blue" index={i} />
              ))}
              {Array.from({ length: SLOTS_PER_TEAM - blueTeam.picks.length }).map((_, i) => (
                <TeamSlot key={`empty-blue-pick-${i}`} heroId={null} type="pick" side="blue" index={blueTeam.picks.length + i} />
              ))}
            </div>
          </div>
        </div>

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
        <div className="flex flex-col px-6 py-8">
          {/* 队名区 - 电竞风格 */}
          <div className="mb-10 flex items-center gap-4 border-b border-lol-red/30 pb-6">
            <div className="relative h-5 w-5 rounded-full bg-lol-red shadow-xl shadow-red-lg animate-pulse" />
            <h2 className="text-4xl font-extrabold text-lol-red tracking-wider">{t('bp.redTeam')}</h2>
          </div>

          {/* Ban 区 */}
          <div className="mb-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-lol-text-secondary">{t('bp.ban')}</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>
            <div className="grid grid-cols-5 gap-5">
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
            <div className="mb-5 flex items-center gap-3">
              <span className="text-base font-bold uppercase tracking-widest text-lol-red">{t('bp.pick')}</span>
              <div className="flex-1 h-px bg-lol-red/40" />
            </div>
            <div className="grid grid-cols-5 gap-5">
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
