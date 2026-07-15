// 后端（Electron 主进程）逻辑测试
// heroService.js 用 CommonJS（module.exports），通过 vite 的 CJS 互操作导入
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { HeroService } from '../heroService.js'

const CDN = 'https://ddragon.leagueoflegends.com/cdn'
const BUILTIN_VERSION = '14.10.5'

describe('HeroService - getHeroImageUrl', () => {
  let svc
  beforeEach(() => { svc = new HeroService() })

  it('对缓存中的英雄返回正确的图片 CDN URL', () => {
    svc.heroesCache.set('Ahri', { id: 'Ahri', version: BUILTIN_VERSION, image: { full: 'Ahri.png' } })
    expect(svc.getHeroImageUrl('Ahri')).toBe(`${CDN}/${BUILTIN_VERSION}/img/champion/Ahri.png`)
  })

  it('对未缓存英雄返回空字符串', () => {
    expect(svc.getHeroImageUrl('Unknown')).toBe('')
  })

  it('显式传入版本时使用该版本', () => {
    svc.heroesCache.set('Ahri', { id: 'Ahri', version: BUILTIN_VERSION, image: { full: 'Ahri.png' } })
    expect(svc.getHeroImageUrl('Ahri', '15.1.1')).toBe(`${CDN}/15.1.1/img/champion/Ahri.png`)
  })
})

describe('HeroService - getSpriteUrl', () => {
  let svc
  beforeEach(() => { svc = new HeroService() })

  it('使用内置默认版本生成 sprite URL', () => {
    expect(svc.getSpriteUrl('champion0.png')).toBe(`${CDN}/${BUILTIN_VERSION}/img/sprite/champion0.png`)
  })

  it('支持显式版本', () => {
    expect(svc.getSpriteUrl('champion0.png', '15.1.1')).toBe(`${CDN}/15.1.1/img/sprite/champion0.png`)
  })
})

describe('HeroService - getAllTags', () => {
  let svc
  beforeEach(() => { svc = new HeroService() })

  it('汇总所有英雄标签并去重排序', () => {
    svc.heroesCache.set('A', { tags: ['Mage', 'Assassin'] })
    svc.heroesCache.set('B', { tags: ['Mage', 'Tank'] })
    expect(svc.getAllTags()).toEqual(['Assassin', 'Mage', 'Tank'])
  })

  it('空缓存返回空数组', () => {
    expect(svc.getAllTags()).toEqual([])
  })
})

describe('HeroService - getHeroById', () => {
  it('按 id 从缓存取英雄', () => {
    const svc = new HeroService()
    svc.heroesCache.set('Ahri', { id: 'Ahri', name: '阿狸' })
    expect(svc.getHeroById('Ahri').name).toBe('阿狸')
  })
})

describe('HeroService - isCacheValid', () => {
  let svc
  beforeEach(() => { svc = new HeroService() })

  it('空缓存视为无效', () => {
    expect(svc.isCacheValid()).toBe(false)
  })

  it('有缓存且在 6 小时内视为有效', () => {
    svc.heroesCache.set('A', {})
    svc.lastFetch = Date.now()
    expect(svc.isCacheValid()).toBe(true)
  })

  it('缓存超过 6 小时视为无效', () => {
    svc.heroesCache.set('A', {})
    svc.lastFetch = Date.now() - (6 * 60 * 60 * 1000 + 1000)
    expect(svc.isCacheValid()).toBe(false)
  })
})

describe('HeroService - clearCache', () => {
  it('清空英雄缓存、版本缓存与时间戳', () => {
    const svc = new HeroService()
    svc.heroesCache.set('A', {})
    svc.versionCache = BUILTIN_VERSION
    svc.lastFetch = 12345
    svc.clearCache()
    expect(svc.heroesCache.size).toBe(0)
    expect(svc.versionCache).toBe(null)
    expect(svc.lastFetch).toBe(0)
  })
})

describe('HeroService - fetchHeroes', () => {
  let svc
  beforeEach(() => { svc = new HeroService() })
  afterEach(() => { vi.restoreAllMocks() })

  it('缓存有效且未显式指定版本时直接返回缓存，不请求网络', async () => {
    svc.heroesCache.set('Ahri', { id: 'Ahri', name: '阿狸', tags: ['Mage'] })
    svc.lastFetch = Date.now()

    const spy = vi.spyOn(global, 'fetch')

    const heroes = await svc.fetchHeroes()
    expect(spy).not.toHaveBeenCalled()
    expect(heroes).toHaveLength(1)
    expect(heroes[0]).toMatchObject({ id: 'Ahri', name: '阿狸' })
  })

  it('解析 Data Dragon 响应并把英雄写入缓存', async () => {
    const fakeData = {
      data: {
        Ahri: {
          id: 'Ahri', name: '阿狸', title: '九尾妖狐', blurb: 'x',
          tags: ['Mage', 'Assassin'],
          image: { full: 'Ahri.png', sprite: 's', group: 'g', x: 0, y: 0, w: 48, h: 48 },
        },
      },
    }
    vi.spyOn(global, 'fetch').mockResolvedValue({ json: async () => fakeData })

    const heroes = await svc.fetchHeroes(BUILTIN_VERSION)
    expect(heroes).toHaveLength(1)
    expect(heroes[0]).toMatchObject({ id: 'Ahri', name: '阿狸', tags: ['Mage', 'Assassin'] })
    expect(svc.getHeroById('Ahri').name).toBe('阿狸')
  })

  it('fetch 失败时抛出错误', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('network'))
    await expect(svc.fetchHeroes(BUILTIN_VERSION)).rejects.toThrow('获取英雄数据失败')
    errSpy.mockRestore()
  })
})

describe('HeroService - getCurrentVersion', () => {
  let svc
  beforeEach(() => { svc = new HeroService() })
  afterEach(() => { vi.restoreAllMocks() })

  it('返回 versions.json 的首个版本并写入缓存', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ json: async () => ['14.10.5', '14.10.4'] })
    const v = await svc.getCurrentVersion()
    expect(v).toBe('14.10.5')
    expect(svc.versionCache).toBe('14.10.5')
  })

  it('缓存命中时不再次发请求', async () => {
    svc.versionCache = '14.10.5'
    svc.lastFetch = Date.now()
    const spy = vi.spyOn(global, 'fetch')
    const v = await svc.getCurrentVersion()
    expect(v).toBe('14.10.5')
    expect(spy).not.toHaveBeenCalled()
  })

  it('网络失败时回退到内置版本', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('net'))
    const v = await svc.getCurrentVersion()
    expect(v).toBe(BUILTIN_VERSION)
    errSpy.mockRestore()
  })
})
