/**
 * 浏览器开发预览用的 electronAPI mock(仅 DEV 模式生效)
 *
 * 作用:让前端在纯浏览器(localhost)里也能预览,无需启动 Electron。
 * 数据直接从 Data Dragon CDN fetch(CORS 已开放:*),走和主进程 heroService 相同的 URL 约定。
 *
 * 安全性:
 * - 仅在 import.meta.env.DEV 为 true 时由 App.tsx 动态导入,生产构建被 tree-shake 掉。
 * - 不影响 Electron 环境(那里 window.electronAPI 已由 preload 注入,本模块直接 return)。
 *
 * 导出/导入等文件操作在浏览器里无法真正实现,用 no-op + 提示替代(预览用途足够)。
 */
import type { ElectronAPI } from '../types/global'
import type { Hero } from '../types/hero'

const DATA_DRAGON_BASE = 'https://ddragon.leagueoflegends.com'
const DATA_DRAGON_CDN = 'https://ddragon.leagueoflegends.com/cdn'
const FALLBACK_VERSION = '16.15.1'

let cachedVersion = ''
const heroCache = new Map<string, Hero>()

// Data Dragon champion.json 响应结构(只列 devMock 用到的字段)
interface DataDragonChampionResponse {
  data: Record<string, {
    id: string
    name: string
    title: string
    blurb: string
    image: { full: string; sprite: string; group: string; x: number; y: number; w: number; h: number }
    tags: string[]
  }>
}

/** 拉取当前最新版本(与 heroService.getCurrentVersion 同源) */
async function getCurrentVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion
  try {
    const res = await fetch(`${DATA_DRAGON_BASE}/api/versions.json`)
    const versions: string[] = await res.json()
    cachedVersion = versions[0] || FALLBACK_VERSION
    return cachedVersion
  } catch {
    cachedVersion = FALLBACK_VERSION
    return cachedVersion
  }
}

/** 拉取并缓存英雄列表(与 heroService.fetchHeroes 同源,适配成 Hero 形状) */
async function fetchHeroes(): Promise<Hero[]> {
  const v = await getCurrentVersion()
  const res = await fetch(`${DATA_DRAGON_CDN}/${v}/data/zh_CN/champion.json`)
  const data: DataDragonChampionResponse = await res.json()
  const heroes: Hero[] = Object.values(data.data).map((hero) => ({
    id: hero.id,
    name: hero.name,
    title: hero.title,
    blurb: hero.blurb,
    version: v,
    image: {
      full: hero.image.full,
      sprite: hero.image.sprite,
      group: hero.image.group,
      x: hero.image.x,
      y: hero.image.y,
      w: hero.image.w,
      h: hero.image.h,
    },
    tags: hero.tags,
  }))
  heroes.forEach(h => heroCache.set(h.id, h))
  return heroes
}

/** 注入浏览器版 electronAPI。重复调用安全(已注入则跳过)。 */
export async function setupDevMock(): Promise<void> {
  // Electron 环境已由 preload 注入真实 API,不覆盖
  if (typeof window !== 'undefined' && window.electronAPI) return

  const mockApi: ElectronAPI = {
    fetchHeroes: async () => {
      try {
        const heroes = await fetchHeroes()
        return { success: true as const, data: heroes }
      } catch (e) {
        return { success: false as const, error: e instanceof Error ? e.message : 'mock fetchHeroes 失败' }
      }
    },

    getHeroImageUrl: async (heroId: string) => {
      // tiles 源:精致方形头像(正式服当前形象),tiles 缺失的英雄回退 img/champion
      // 注意:TILES_MISSING 必须与 src/main/services/heroService.js 的 TILES_MISSING 保持同步
      // (实测仅 Fiddlesticks 缺失,两端各定义一份;主进程是 CJS 无法被渲染进程直接 import)
      const TILES_MISSING = new Set(['Fiddlesticks'])
      if (TILES_MISSING.has(heroId)) {
        const v = await getCurrentVersion()
        return { success: true as const, data: `${DATA_DRAGON_CDN}/${v}/img/champion/${heroId}.png` }
      }
      return { success: true as const, data: `${DATA_DRAGON_CDN}/img/champion/tiles/${heroId}_0.jpg` }
    },

    getHeroSplashUrl: async (heroId: string, type: 'loading' | 'splash' | 'centered' = 'loading') => {
      const folder = type === 'splash' ? 'splash' : type === 'centered' ? 'centered' : 'loading'
      return { success: true as const, data: `${DATA_DRAGON_CDN}/img/champion/${folder}/${heroId}_0.jpg` }
    },

    getCurrentVersion: async () => {
      const v = await getCurrentVersion()
      return { success: true as const, data: v }
    },

    // 文件操作在浏览器无法真正实现,返回取消(非错误),预览不卡住
    exportData: async () => ({ success: false as const, canceled: true as const }),
    importData: async () => ({ success: false as const, canceled: true as const }),

    platform: 'win32',
  }

  if (typeof window !== 'undefined') {
    (window as unknown as { electronAPI: ElectronAPI }).electronAPI = mockApi
  }
}
