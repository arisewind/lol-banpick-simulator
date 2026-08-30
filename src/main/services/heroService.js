// 英雄数据服务（Electron 主进程）

const DATA_DRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com'
const DATA_DRAGON_CDN = 'https://ddragon.leagueoflegends.com/cdn'
// 离线兜底版本(getCurrentVersion 网络失败时使用)。紧跟 Data Dragon 最新发布版本,
// 定期同步;断网时 Data Dragon 仍服务该版本,故可作离线兜底。
// 最近一次同步:2026-08(对应 Data Dragon 最新版本)
const BUILTIN_FALLBACK_VERSION = '16.15.1'
// tiles 源缺失的英雄(实测 Fiddlesticks 返回 403)。导出供 devMock 复用,避免两处定义漂移
const TILES_MISSING = new Set(['Fiddlesticks'])
// splash(横版原画)源仍挂 VGU 前(视觉更新)旧原画的英雄。
// 这些英雄的 splash/X_0.jpg 是怀旧服原画,但 loading(竖版)已是新版,
// 故 pick 槽请求 splash 时回退到 loading。导出供 devMock 同步。
// 实测发现:Fiddlesticks 经历过 VGU,Data Dragon 的 splash 资源未更新,loading 已更新。
const SPLASH_FALLBACK = new Set(['Fiddlesticks'])
// 英雄主流分路映射(id -> lanes[]),数据源 src/data/championLanes.json。
// Data Dragon 不提供分路数据,这份映射源自 LoL Wiki draft position,离线固化。
const CHAMPION_LANES = require('../../data/championLanes.json')

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

      const heroes = Object.values(data.data)
        // 过滤 Data Dragon 16.x 起混入的 Jade_* "翡翠/怀旧" 变体条目:
        // 它们与正式英雄同名(中文名完全一致)但 id 带 Jade_ 前缀,用的是旧原画,
        // 不是正式服英雄(16.15.1 实测 60 个)。不过滤会导致英雄列表凭空多出 60 个、
        // 且成对出现"怀旧服原画"。正式孙悟空 id 为 MonkeyKing,Jade_Wukong 也被一并滤除。
        .filter((hero) => !hero.id.startsWith('Jade_'))
        .map((hero) => ({
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
        // 注入主流分路(映射表查不到的默认空数组)
        lanes: CHAMPION_LANES[hero.id] || [],
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
   * 获取英雄头像 URL(方形头像,网格/列表用)
   *
   * 资源源选择(关键):
   * - tiles/X_0.jpg:从原画裁切的精致方形头像,画风 = 正式服当前形象(玩家熟悉),首选
   * - img/champion/X.png:LOL 早期游戏内小图标画风,视觉偏旧,仅作 tiles 缺失时的回退
   *
   * tiles 源覆盖绝大多数英雄(实测 172/173),仅 TILES_MISSING 中的英雄缺失(403)。
   * 对已知缺失的英雄回退到 img/champion 源(虽画风旧但至少能显示,避免头像消失)。
   */
  getHeroImageUrl(heroId, version) {
    if (!heroId) return ''
    if (TILES_MISSING.has(heroId)) {
      const hero = this.heroesCache.get(heroId)
      const v = version || hero?.version || BUILTIN_FALLBACK_VERSION
      return `${DATA_DRAGON_CDN}/${v}/img/champion/${hero?.image.full || `${heroId}.png`}`
    }
    return `${DATA_DRAGON_CDN}/img/champion/tiles/${heroId}_0.jpg`
  }

  /**
   * 获取英雄原画 URL(大图,pick 槽展示用)
   * Data Dragon 提供三种原画格式,均无需 version 路径段:
   *   - 'loading':竖版加载原画(308×560),适合竖向 pick 槽(本项目默认)
   *   - 'splash':横版全屏原画,适合宽幅展示
   *   - 'centered':居中裁切竖版,适合背景
   * 文件名约定:{heroId}_0.jpg(默认皮肤)
   *
   * 异常回退:SPLASH_FALLBACK 中的英雄(如 Fiddlesticks 经历过 VGU),
   * 其 splash 横版原画是怀旧服旧版,但 loading 竖版已是新版。
   * 故请求 splash 时对这些英雄回退到 loading,保证显示正式服当前原画。
   */
  getHeroSplashUrl(heroId, type = 'loading') {
    if (!heroId) return ''
    // splash 源异常的英雄回退到 loading(新版原画)
    const effectiveType = type === 'splash' && SPLASH_FALLBACK.has(heroId) ? 'loading' : type
    const folder = effectiveType === 'splash' ? 'splash' : effectiveType === 'centered' ? 'centered' : 'loading'
    return `${DATA_DRAGON_CDN}/img/champion/${folder}/${heroId}_0.jpg`
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
module.exports = { heroService: heroServiceInstance, HeroService, BUILTIN_FALLBACK_VERSION, TILES_MISSING, SPLASH_FALLBACK }
