import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { HeroWithStats } from '../../types/hero'
import { cn } from '../../utils/cn'
import { useHeroImage } from '../../hooks/useHeroImage'

interface HeroCardProps {
  hero: HeroWithStats
  isDisabled: boolean
  isCurrentPhase: boolean
  actionType: 'ban' | 'pick' | null
  onSelect: (heroId: string) => void
}

function HeroCard({ hero, isDisabled, isCurrentPhase, actionType, onSelect }: HeroCardProps) {
  const { t } = useTranslation()
  const { imageUrl, imageError } = useHeroImage(hero.id)

  const getCardStyle = () => {
    if (isDisabled) {
      return cn(
        'opacity-40 grayscale cursor-not-allowed bg-lol-bg-black/80 border-2 border-lol-border',
        'transition-all duration-150 ease-out'
      )
    }

    if (!isCurrentPhase) {
      return cn(
        'opacity-50 cursor-not-allowed bg-lol-bg-black/60 border-2 border-lol-border',
        'transition-all duration-150 ease-out'
      )
    }

    // 可交互状态：ban/pick 仅颜色 token 不同。必须用完整字面量三元，禁止 `${color}` 拼接——
    // Tailwind JIT 只扫描字面量，动态拼接的类名不会被生成。
    const accent = actionType === 'ban'
      ? 'border-lol-red/40 hover:border-lol-red/60 hover:shadow-red'
      : 'border-lol-blue/40 hover:border-lol-blue/60 hover:shadow-blue'

    return cn(
      'cursor-pointer bg-lol-bg-black/80 border-2',
      'transition-all duration-150 ease-out',
      'hover:scale-105 active:scale-100',
      'hover:shadow-lg hover:shadow-lol-gold/20',
      accent,
      'animate-fade-in'
    )
  }

  const getActionBadge = () => {
    if (!isCurrentPhase || isDisabled || !actionType) return null

    // ban/pick 仅颜色 token 与文案不同；同样用字面量三元，不可拼接
    const isBan = actionType === 'ban'

    return (
      <div className={cn(
        'absolute right-1 top-1 rounded px-2 py-1 text-white text-[10px] font-bold border',
        isBan
          ? 'bg-lol-red border-lol-red/50 glow-red'
          : 'bg-lol-blue border-lol-blue/50 glow-blue',
        'animate-glow',
        'transition-all duration-150'
      )}>
        {t(isBan ? 'bp.ban' : 'bp.pick')}
      </div>
    )
  }

  return (
    <div
      onClick={() => onSelect(hero.id)}
      className={`relative flex aspect-[2/3] flex-col items-center justify-center overflow-hidden rounded-lg border p-2 min-w-[100px] max-w-[120px] ${getCardStyle()}`}
      title={`${hero.name} - ${hero.title}`}
    >
      {/* 英雄头像 */}
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={hero.name}
          className="h-20 w-20 object-contain drop-shadow-md"
          onError={() => {/* 错误状态由 Hook 管理 */}}
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lol-bg-dark text-lol-text-muted">
          <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* 英雄名称 */}
      <span className="mt-3 text-center text-sm font-medium text-lol-text-secondary line-clamp-2 leading-tight">
        {hero.name}
      </span>

      {/* 操作标签 */}
      {getActionBadge()}

      {/* 已选择标记 */}
      {isDisabled && (
        <div className="absolute right-1 bottom-1 h-2 w-2 rounded-full bg-green-500 shadow" />
      )}
    </div>
  )
}

// memo 优化：props 浅比较。hero 对象引用稳定（来自 useMemo filteredHeroes），
// onSelect 由 HeroGrid 用 useCallback 稳定 → 搜索/标签变化时未变卡片可跳过重渲染
export default memo(HeroCard)
