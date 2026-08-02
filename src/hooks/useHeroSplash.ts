import { useState, useEffect } from 'react'

type SplashType = 'loading' | 'splash' | 'centered'

interface UseHeroSplashResult {
  splashUrl: string | null
  splashError: boolean
  isLoading: boolean
}

/**
 * 自定义 Hook：加载英雄原画 URL（loading/splash/centered）
 * 与 useHeroImage 同模式,但走 getHeroSplashUrl IPC,用于 pick 槽大图展示。
 *
 * @param heroId - 英雄 ID
 * @param type - 原画类型,默认 'loading'(竖版,适配竖向 pick 槽)
 */
export function useHeroSplash(heroId: string | null | undefined, type: SplashType = 'loading'): UseHeroSplashResult {
  const [splashUrl, setSplashUrl] = useState<string | null>(null)
  const [splashError, setSplashError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!heroId) {
      setSplashUrl(null)
      setSplashError(false)
      setIsLoading(false)
      return
    }

    let mounted = true
    setIsLoading(true)
    setSplashError(false)

    const fetchSplashUrl = async () => {
      try {
        const result = await window.electronAPI.getHeroSplashUrl(heroId, type)
        if (mounted && result.success && result.data) {
          setSplashUrl(result.data)
          setSplashError(false)
        } else if (mounted) {
          setSplashError(true)
        }
      } catch (error) {
        if (mounted) {
          setSplashError(true)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchSplashUrl()

    return () => {
      mounted = false
    }
  }, [heroId, type])

  return { splashUrl, splashError, isLoading }
}
