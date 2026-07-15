import { describe, it, expect } from 'vitest'
import { calcSynergy } from '../synergy'
import { calcMatchup } from '../matchup'
import { recommendHeroes } from '../recommend'
import type { Hero } from '../../../types/hero'

const mkHero = (id: string, tags: string[]): Hero => ({
  id, name: id, title: '', blurb: '', version: '1',
  image: { full: '', sprite: '', group: '', x: 0, y: 0, w: 0, h: 0 },
  tags,
})

describe('calcSynergy', () => {
  it('空 picks 返回 0 分', () => {
    expect(calcSynergy([])).toEqual({ score: 0, strongSynergies: [], weakSynergies: [] })
  })

  it('覆盖多标签得分高于单一标签', () => {
    const diverse = [
      mkHero('A', ['Marksman']), mkHero('B', ['Mage']), mkHero('C', ['Tank']),
      mkHero('D', ['Support']), mkHero('E', ['Fighter']),
    ]
    const mono = [mkHero('A', ['Marksman']), mkHero('B', ['Marksman']), mkHero('C', ['Marksman'])]
    expect(calcSynergy(diverse).score).toBeGreaterThan(calcSynergy(mono).score)
  })

  it('命中协同组合记入 strongSynergies', () => {
    const picks = [mkHero('A', ['Assassin']), mkHero('B', ['Marksman'])]
    const result = calcSynergy(picks)
    expect(result.strongSynergies.length).toBeGreaterThan(0)
  })

  it('缺失标签记入 weakSynergies', () => {
    const picks = [mkHero('A', ['Marksman'])]
    const result = calcSynergy(picks)
    expect(result.weakSynergies).toContain('Mage')
    expect(result.weakSynergies).toContain('Tank')
  })
})

describe('calcMatchup', () => {
  it('双方空 picks 视为均势', () => {
    expect(calcMatchup([], [])).toEqual({
      winner: 'even', blueAdvantage: 50, redAdvantage: 50, keyFactors: [],
    })
  })

  it('蓝方刺客克制红方法师 → 蓝方优势', () => {
    const result = calcMatchup([mkHero('Zed', ['Assassin'])], [mkHero('Ahri', ['Mage'])])
    expect(result.winner).toBe('blue')
    expect(result.blueAdvantage).toBeGreaterThan(result.redAdvantage)
    expect(result.keyFactors.length).toBeGreaterThan(0)
  })

  it('红方坦克克制蓝方刺客 → 红方优势', () => {
    const result = calcMatchup([mkHero('Zed', ['Assassin'])], [mkHero('Malphite', ['Tank'])])
    expect(result.winner).toBe('red')
  })

  it('无克制关系视为均势', () => {
    const result = calcMatchup([mkHero('A', ['Marksman'])], [mkHero('B', ['Marksman'])])
    expect(result.winner).toBe('even')
    expect(result.blueAdvantage).toBe(50)
  })
})

describe('recommendHeroes', () => {
  const pool = [
    mkHero('Zed', ['Assassin']),
    mkHero('Jinx', ['Marksman']),
    mkHero('Ahri', ['Mage']),
    mkHero('Leona', ['Tank', 'Support']),
    mkHero('Garen', ['Fighter', 'Tank']),
  ]

  it('过滤已 ban/pick 的英雄', () => {
    const recs = recommendHeroes(pool, [], [], ['Zed', 'Jinx'])
    const ids = recs.map(r => r.heroId)
    expect(ids).not.toContain('Zed')
    expect(ids).not.toContain('Jinx')
  })

  it('克制对方核心的英雄优先级为 high', () => {
    const enemyPicks = [mkHero('EnemyMage', ['Mage'])]
    const recs = recommendHeroes(pool, [], enemyPicks, [])
    const zed = recs.find(r => r.heroId === 'Zed')
    expect(zed?.priority).toBe('high')
  })

  it('返回最多 5 个推荐', () => {
    const recs = recommendHeroes(pool, [], [], [])
    expect(recs.length).toBeLessThanOrEqual(5)
  })

  it('high 优先级排在 medium 之前', () => {
    const enemyPicks = [mkHero('EnemyMage', ['Mage'])]
    const recs = recommendHeroes(pool, [], enemyPicks, [])
    const firstHigh = recs.findIndex(r => r.priority === 'high')
    const firstMedium = recs.findIndex(r => r.priority === 'medium')
    if (firstHigh >= 0 && firstMedium >= 0) {
      expect(firstHigh).toBeLessThan(firstMedium)
    }
  })
})
