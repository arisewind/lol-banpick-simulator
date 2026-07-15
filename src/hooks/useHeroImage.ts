import { useState, useEffect } from 'react'

interface UseHeroImageResult {
  imageUrl: string | null
  imageError: boolean
  isLoading: boolean
}

/**
 * 自定义 Hook：加载英雄头像图片
 * 统一管理图片加载逻辑，避免在多个组件中重复
 *
 * @param heroId - 英雄 ID
 * @returns 包含图片 URL、错误状态和加载状态的对象
 */
export function useHeroImage(heroId: string | null | undefined): UseHeroImageResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!heroId) {
      setImageUrl(null)
      setImageError(false)
      setIsLoading(false)
      return
    }

    let mounted = true
    setIsLoading(true)
    setImageError(false)

    const fetchImageUrl = async () => {
      try {
        const result = await window.electronAPI.getHeroImageUrl(heroId)
        if (mounted && result.success && result.data) {
          setImageUrl(result.data)
          setImageError(false)
        } else if (mounted) {
          setImageError(true)
        }
      } catch (error) {
        if (mounted) {
          setImageError(true)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchImageUrl()

    return () => {
      mounted = false
    }
  }, [heroId])

  return { imageUrl, imageError, isLoading }
}