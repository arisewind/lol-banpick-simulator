import { useState, useEffect } from 'react'
import type { HeroWithStats } from '../../types/hero'

interface HeroCardProps {
  hero: HeroWithStats
  isDisabled: boolean
  isCurrentPhase: boolean
  actionType: 'ban' | 'pick' | null
  onClick: () => void
}

export default function HeroCard({ hero, isDisabled, isCurrentPhase, actionType, onClick }: HeroCardProps) {
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
      return 'opacity-30 cursor-not-allowed bg-slate-800'
    }

    if (!isCurrentPhase) {
      return 'opacity-50 cursor-not-allowed bg-slate-800'
    }

    const baseStyle = 'cursor-pointer transition hover:scale-105 hover:shadow-lg'

    if (actionType === 'ban') {
      return `${baseStyle} bg-red-950/30 hover:bg-red-950/50 border-red-900/30 hover:border-red-700/50`
    } else {
      return `${baseStyle} bg-blue-950/30 hover:bg-blue-950/50 border-blue-900/30 hover:border-blue-700/50`
    }
  }

  const getActionBadge = () => {
    if (!isCurrentPhase || isDisabled) return null

    if (actionType === 'ban') {
      return (
        <div className="absolute right-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
          BAN
        </div>
      )
    } else if (actionType === 'pick') {
      return (
        <div className="absolute right-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
          PICK
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
          className="h-12 w-12 object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-slate-500">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* 英雄名称 */}
      <span className="mt-1 text-center text-xs font-medium text-slate-300 line-clamp-1">
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
