// 英雄数据服务（Electron 主进程）

const DATA_DRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com'
const DATA_DRAGON_CDN = 'https://ddragon.leagueoflegends.com/cdn'
// 离线兜底版本（getCurrentVersion 网络失败时使用）。非"当前版本"——Data Dragon 仍服务旧版本，故离线可用。
const BUILTIN_FALLBACK_VERSION = '14.10.5'

/**
 * HeroService 类
 */
class HeroService {
  constructor() {
    this.heroesCache = new Map()
    this.versionCache = null
    this.lastFetch = 0
    this.CACHE_DURATION = 6 * 60 * 60 * 1000
  }

  /**
   * 获取当前游戏版本
   */
  async getCurrentVersion() {
    if (this.versionCache && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.versionCache
    }

    try {
      const response = await fetch(`${DATA_DRAGON_BASE_URL}/api/versions.json`)
      const versions = await response.json()
      this.versionCache = versions[0]
      this.lastFetch = Date.now()
      return this.versionCache
    } catch (error) {
      console.error('Failed to fetch versions:', error)
      return BUILTIN_FALLBACK_VERSION
    }
  }

  /**
   * 从 Data Dragon 获取英雄列表
   */
  async fetchHeroes(version) {
    // 缓存有效且未显式指定版本时直接返回缓存，避免每次都请求网络（修复"缓存只写不读"缺陷）
    if (!version && this.isCacheValid()) {
      return Array.from(this.heroesCache.values())
    }
    const v = version || await this.getCurrentVersion()

    try {
      const response = await fetch(
        `${DATA_DRAGON_CDN}/${v}/data/zh_CN/champion.json`
      )
      const data = await response.json()

      const heroes = Object.values(data.data).map((hero) => ({
        id: hero.id,
        name: hero.name,
        title: hero.title,
        blurb: hero.blurb,
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
        version: v,
      }))

      heroes.forEach((hero) => {
        this.heroesCache.set(hero.id, hero)
      })
      this.lastFetch = Date.now()

      return heroes
    } catch (error) {
      console.error('Failed to fetch heroes:', error)
      throw new Error('获取英雄数据失败')
    }
  }

  /**
   * 获取英雄头像 URL
   */
  getHeroImageUrl(heroId, version) {
    const hero = this.heroesCache.get(heroId)
    if (!hero) return ''
    const v = version || hero.version
    return `${DATA_DRAGON_CDN}/${v}/img/champion/${hero.image.full}`
  }

  /**
   * 获取英雄加载 Sprite URL
   */
  getSpriteUrl(spriteName, version) {
    const v = version || BUILTIN_FALLBACK_VERSION
    return `${DATA_DRAGON_CDN}/${v}/img/sprite/${spriteName}`
  }

  /**
   * 根据ID获取英雄
   */
  getHeroById(id) {
    return this.heroesCache.get(id)
  }

  /**
   * 获取所有标签
   */
  getAllTags() {
    const tagsSet = new Set()
    for (const hero of this.heroesCache.values()) {
      hero.tags.forEach((tag) => tagsSet.add(tag))
    }
    return Array.from(tagsSet).sort()
  }

  /**
   * 检查缓存是否有效
   */
  isCacheValid() {
    return this.heroesCache.size > 0 && Date.now() - this.lastFetch < this.CACHE_DURATION
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.heroesCache.clear()
    this.versionCache = null
    this.lastFetch = 0
  }
}

// 导出单例实例
const heroServiceInstance = new HeroService()
module.exports = { heroService: heroServiceInstance, HeroService }
