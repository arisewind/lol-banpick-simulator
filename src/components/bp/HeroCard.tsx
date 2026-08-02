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

/**
 * 英雄卡 —— pickban.pro 风格
 * - 透明背景按钮,方形黑底头像;hover 时背景变浅灰、整体提亮(非放大)
 * - 禁用(已 ban/pick):灰度 + 浅灰底,视觉上"被锁住"
 * - 当前可操作:ban=品红描边 / pick=金色描边;角标为实心标签,无外发光
 */
function HeroCard({ hero, isDisabled, isCurrentPhase, actionType, onSelect }: HeroCardProps) {
  const { t } = useTranslation()
  const { imageUrl, imageError } = useHeroImage(hero.id)

  const getCardStyle = () => {
    if (isDisabled) {
      return cn(
        'grayscale cursor-not-allowed bg-[#1c1c1c] border-2 border-lol-border',
        'transition-all duration-150 ease-out'
      )
    }

    if (!isCurrentPhase) {
      return cn(
        'opacity-50 cursor-not-allowed bg-lol-bg-black/60 border-2 border-lol-border',
        'transition-all duration-150 ease-out'
      )
    }

    // 可交互状态:ban/pick 仅颜色 token 不同。必须用完整字面量三元,禁止 `${color}` 拼接——
    // Tailwind JIT 只扫描字面量,动态拼接的类名不会被生成。
    const accent = actionType === 'ban'
      ? 'border-lol-red hover:bg-[#1c1c1c]'
      : 'border-lol-blue hover:bg-[#1c1c1c]'

    return cn(
      'cursor-pointer bg-transparent border-2',
      'transition-all duration-150 ease-out',
      'hover:brightness-110',
      accent,
      'animate-fade-in'
    )
  }

  const getActionBadge = () => {
    if (!isCurrentPhase || isDisabled || !actionType) return null

    // ban/pick 仅颜色 token 与文案不同;同样用字面量三元,不可拼接
    const isBan = actionType === 'ban'

    return (
      <div className={cn(
        'absolute right-1 top-1 rounded-sm px-1.5 py-0.5 text-white text-[10px] font-bold border',
        isBan
          ? 'bg-lol-red border-lol-red/50'
          : 'bg-lol-blue border-lol-blue/50',
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
      className={`relative flex w-full flex-col items-center justify-start overflow-hidden rounded border px-2 py-2.5 ${getCardStyle()}`}
      title={`${hero.name} - ${hero.title}`}
    >
      {/* 英雄头像 —— 完全撑满卡片(无黑边/无 padding),方形头像直接 cover 填满 */}
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={hero.name}
          className="aspect-square w-full object-cover"
          onError={() => {/* 错误状态由 Hook 管理 */}}
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-lol-bg-secondary text-lol-text-muted">
          <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* 英雄名称 */}
      <span className="mt-1.5 line-clamp-1 w-full text-center text-xs font-medium text-lol-text-secondary leading-tight">
        {hero.name}
      </span>

      {/* 操作标签 */}
      {getActionBadge()}

      {/* 已选择标记 */}
      {isDisabled && (
        <div className="absolute right-1 bottom-1 h-2 w-2 rounded-full bg-green-500 shadow-hard-sm" />
      )}
    </div>
  )
}

// memo 优化:props 浅比较。hero 对象引用稳定(来自 useMemo filteredHeroes),
// onSelect 由 HeroGrid 用 useCallback 稳定 → 搜索/标签变化时未变卡片可跳过重渲染
export default memo(HeroCard)
