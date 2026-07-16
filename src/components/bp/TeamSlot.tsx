import { useHeroes } from '../../contexts/HeroContext'
import { cn } from '../../utils/cn'
import { useHeroImage } from '../../hooks/useHeroImage'

export interface TeamSlotProps {
  heroId: string | null
  type: 'ban' | 'pick'
  side: 'blue' | 'red'
  index: number
}

/**
 * 单个 ban/pick 槽位
 * - ban 位：小正方形 + 灰度斜线
 * - pick 位：战队色边框 + 发光 + 底部英雄名
 */
function TeamSlot({ heroId, type, side, index }: TeamSlotProps) {
  const { getHeroById } = useHeroes()
  const hero = heroId ? getHeroById(heroId) : null
  const { imageUrl } = useHeroImage(hero?.id)

  const isBan = type === 'ban'
  const isBlue = side === 'blue'

  // 空槽位：仅显示序号
  if (!hero) {
    return (
      <div className={cn(
        'relative overflow-hidden rounded-lg bg-black/40 border border-lol-border/50',
        isBan ? 'aspect-square w-16 h-16' : 'aspect-[4/3]'
      )}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'font-mono text-lol-text-muted/60',
            isBan ? 'text-lg' : 'text-2xl'
          )}>{index + 1}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg transition-all duration-300',
        'border-2',
        // Ban 位：更小的正方形
        isBan ? 'aspect-square w-16 h-16 bg-black/60 border-lol-border' : 'aspect-[4/3] bg-black/40',
        // Pick 位：战队色边框和发光
        !isBan && (isBlue ? 'border-lol-blue shadow-blue-lg' : 'border-lol-red shadow-red-lg'),
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

      {/* 渐变背景 - Pick 位 */}
      {!isBan && (
        <div className={cn(
          'absolute inset-0',
          isBlue
            ? 'bg-gradient-to-br from-blue-900/40 to-black'
            : 'bg-gradient-to-br from-red-900/40 to-black'
        )} />
      )}

      {/* Ban 位斜线标记 */}
      {isBan && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-white/80 rotate-45" />
        </div>
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
          <span className={cn(
            'text-lol-text-muted',
            isBan ? 'text-sm' : 'text-xl'
          )}>{hero.name.slice(0, 2)}</span>
        </div>
      )}

      {/* 底部渐变遮罩 + 英雄名 */}
      {!isBan && (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent p-2">
          <p className={cn(
            'text-center text-sm font-bold tracking-wide',
            isBlue ? 'text-lol-blue' : 'text-lol-red',
          )}>
            {hero.name}
          </p>
        </div>
      )}

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

export default TeamSlot
