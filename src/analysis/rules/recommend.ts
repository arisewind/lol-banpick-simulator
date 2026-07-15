import type { Hero } from '../../types/hero'
import type { Recommendation } from '../types'
import { COUNTER_RULES, DESIRED_TAGS } from './constants'

/**
 * 推荐英雄（纯函数）
 * 基于当前双方已 pick，推荐"克制对方核心"或"补齐己方缺位标签"的英雄，过滤已 ban/pick。
 * 按优先级（high > medium > low）排序，取前 5。
 *
 * @param heroes 全英雄池（含 tags）
 * @param ownPicks 己方已 pick 英雄
 * @param enemyPicks 对方已 pick 英雄
 * @param excludedIds 已 ban + 已 pick 的英雄 id（不可再选）
 */
export function recommendHeroes(
  heroes: Hero[],
  ownPicks: Hero[],
  enemyPicks: Hero[],
  excludedIds: string[],
): Recommendation[] {
  const excluded = new Set(excludedIds)
  const ownTags = new Set(ownPicks.flatMap(h => h.tags))
  const enemyTags = new Set(enemyPicks.flatMap(h => h.tags))

  const candidates = heroes.filter(h => !excluded.has(h.id))

  const recommendations: Recommendation[] = candidates.map(hero => {
    const reasons: string[] = []
    let priority: 'high' | 'medium' | 'low' = 'low'

    // 克制对方核心
    const countersEnemy = hero.tags.some(t =>
      (COUNTER_RULES[t] || []).some(c => enemyTags.has(c)),
    )
    if (countersEnemy) {
      reasons.push('克制对方核心阵容')
      priority = 'high'
    }

    // 补齐己方缺位标签
    const missingTags = hero.tags.filter(t => DESIRED_TAGS.includes(t) && !ownTags.has(t))
    if (missingTags.length > 0) {
      reasons.push(`补齐己方缺位：${missingTags.join('/')}`)
      if (priority !== 'high') priority = 'medium'
    }

    if (reasons.length === 0) {
      reasons.push('通用可选')
    }

    return { heroId: hero.id, reason: reasons.join('；'), priority }
  })

  const priorityOrder: Record<Recommendation['priority'], number> = { high: 0, medium: 1, low: 2 }
  return recommendations
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5)
}
