import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { HeroWithStats } from '../../types/hero'
import { cn } from '../../utils/cn'

interface HeroCardProps {
  hero: HeroWithStats
  isDisabled: boolean
  isCurrentPhase: boolean
  actionType: 'ban' | 'pick' | null
  onClick: () => void
}

export default function HeroCard({ hero, isDisabled, isCurrentPhase, actionType, onClick }: HeroCardProps) {
  const { t } = useTranslation()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    let mounted = true

    const fetchImageUrl = async () => {
      try {
        const result = await window.electronAPI.getHeroImageUrl(hero.id)
        if (mounted && result.success && result.data) {
          setImageUrl(result.data)
        }
      } catch (error) {
        if (mounted) {
          setImageError(true)
        }
      }
    }

    fetchImageUrl()

    return () => {
      mounted = false
    }
  }, [hero.id])

  const getCardStyle = () => {
    if (isDisabled) {
      return cn(
        'opacity-40 grayscale cursor-not-allowed bg-slate-900/80 border-2 border-slate-700',
        'transition-all duration-150 ease-out'
      )
    }

    if (!isCurrentPhase) {
      return cn(
        'opacity-50 cursor-not-allowed bg-slate-900/60 border-2 border-slate-700',
        'transition-all duration-150 ease-out'
      )
    }

    // 可交互状态
    const baseStyle = cn(
      'cursor-pointer bg-slate-900/80 border-2',
      'transition-all duration-150 ease-out',
      'hover:scale-105 active:scale-100',
      'hover:shadow-lg hover:shadow-lol-gold/20'
    )

    if (actionType === 'ban') {
      return cn(
        baseStyle,
        'border-lol-red/40 hover:border-lol-red/60 hover:shadow-red',
        'animate-fade-in'
      )
    } else {
      return cn(
        baseStyle,
        'border-lol-blue/40 hover:border-lol-blue/60 hover:shadow-blue',
        'animate-fade-in'
      )
    }
  }

  const getActionBadge = () => {
    if (!isCurrentPhase || isDisabled) return null

    if (actionType === 'ban') {
      return (
        <div className={cn(
          'absolute right-1 top-1 rounded px-2 py-1',
          'bg-lol-red text-white text-[10px] font-bold',
          'border border-lol-red/50',
          'animate-glow glow-red',
          'transition-all duration-150'
        )}>
          {t('bp.ban')}
        </div>
      )
    } else if (actionType === 'pick') {
      return (
        <div className={cn(
          'absolute right-1 top-1 rounded px-2 py-1',
          'bg-lol-blue text-white text-[10px] font-bold',
          'border border-lol-blue/50',
          'animate-glow glow-blue',
          'transition-all duration-150'
        )}>
          {t('bp.pick')}
        </div>
      )
    }
    return null
  }

  return (
    <div
      onClick={onClick}
      className={`relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded border p-2 ${getCardStyle()}`}
      title={`${hero.name} - ${hero.title}`}
    >
      {/* 英雄头像 */}
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={hero.name}
          className="h-16 w-16 object-contain drop-shadow-md"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 text-slate-500">
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* 英雄名称 */}
      <span className="mt-2 text-center text-xs font-medium text-slate-300 line-clamp-2 leading-tight">
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
