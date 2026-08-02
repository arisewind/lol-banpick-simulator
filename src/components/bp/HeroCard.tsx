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
 * 英雄卡 —— pickban.pro 规范(从其 CSS bundle 反向还原)
 *
 * 核心特征(与「撑满格子」的做法相反):
 * - 固定宽度透明按钮(110px),居中放进网格格子;背景透明,融入主背景
 * - 内部是 grid:80px 黑底方形头像(居中) + 下方一行名字
 * - hover:背景变浅灰 + 提亮(非放大)
 * - 禁用(已 ban/pick):grayscale + #1c1c1c 灰底,名字变灰 —— 「被锁住」的视觉
 */
function HeroCard({ hero, isDisabled, isCurrentPhase, actionType, onSelect }: HeroCardProps) {
  const { t } = useTranslation()
  const { imageUrl, imageError } = useHeroImage(hero.id)

  const getCardStyle = () => {
    if (isDisabled) {
      // C 风格:禁用态半透明黑底 + 灰度
      return cn(
        'grayscale cursor-not-allowed bg-black/30 border-2 border-lol-border',
        'transition-all duration-150 ease-out'
      )
    }

    if (!isCurrentPhase) {
      return cn(
        'opacity-50 cursor-not-allowed bg-transparent border-2 border-transparent',
        'transition-all duration-150 ease-out'
      )
    }

    // C 风格:默认队伍色淡边框(标识当前 ban/pick),hover 变金色边框 + 金色底晕
    return cn(
      'cursor-pointer bg-black/30 border-2',
      'transition-all duration-150 ease-out',
      'hover:border-lol-gold hover:bg-lol-gold/10 hover:brightness-110',
      actionType === 'ban'
        ? 'border-lol-red/40'
        : 'border-lol-blue/40',
      'animate-fade-in'
    )
  }

  const getActionBadge = () => {
    if (!isCurrentPhase || isDisabled || !actionType) return null
    const isBan = actionType === 'ban'

    return (
      <div className={cn(
        'absolute right-1 top-1 rounded-sm px-1.5 py-0.5 text-white text-[10px] font-bold border',
        'opacity-0 group-hover:opacity-100',
        isBan
          ? 'bg-lol-red border-lol-red/50'
          : 'bg-lol-blue border-lol-blue/50',
        'transition-opacity duration-150'
      )}>
        {t(isBan ? 'bp.ban' : 'bp.pick')}
      </div>
    )
  }

  return (
    <div
      onClick={() => onSelect(hero.id)}
      // 固定 110px 宽透明按钮(grid 布局),居中放进网格格子 —— 对齐 pickban 规范
      className={`group relative grid w-[110px] mx-auto border-2 px-[5px] pt-[15px] pb-[10px] ${getCardStyle()}`}
      title={`${hero.name} - ${hero.title}`}
    >
      {/* 英雄头像:80px 方形黑底,居中(pickban 规范:图片底色纯黑) */}
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={hero.name}
          className="mx-auto h-[80px] w-[80px] bg-black object-contain p-[3px]"
          onError={() => {/* 错误状态由 Hook 管理 */}}
        />
      ) : (
        <div className="mx-auto flex h-[80px] w-[80px] items-center justify-center bg-black text-lol-text-muted">
          <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* 英雄名字:头像下方,居中,小字号(pickban: font-size .9rem) */}
      <span className="mt-[5px] w-full text-center text-xs leading-tight text-lol-text-secondary line-clamp-1">
        {hero.name}
      </span>

      {/* 操作标签:hover 显示 */}
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
