import type { Hero } from '../../types/hero'
import type { SynergyScore } from '../types'
import { SYNERGY_PAIRS, DESIRED_TAGS } from './constants'

/**
 * 计算阵容协同度（纯函数）
 * - 标签多样性：覆盖理想标签的比例（满分 60）
 * - 协同组合：命中 SYNERGY_PAIRS 的组合加分（每对 +10）
 * - 重复标签惩罚：同标签超过 2 个时扣分
 */
export function calcSynergy(picks: Hero[]): SynergyScore {
  if (picks.length === 0) {
    return { score: 0, strongSynergies: [], weakSynergies: [] }
  }

  const tags = picks.flatMap(h => h.tags)
  const tagSet = new Set(tags)
  const strongSynergies: string[] = []
  const weakSynergies: string[] = []

  // 1. 协同组合加分
  let synergyBonus = 0
  for (const hero of picks) {
    for (const tag of hero.tags) {
      const partners = SYNERGY_PAIRS[tag] || []
      for (const partner of partners) {
        if (tagSet.has(partner)) {
          synergyBonus += 10
          const pair = [tag, partner].sort().join('+')
          if (!strongSynergies.includes(pair)) strongSynergies.push(pair)
        }
      }
    }
  }

  // 2. 标签多样性
  const desiredCovered = DESIRED_TAGS.filter(t => tagSet.has(t)).length
  const diversityScore = (desiredCovered / DESIRED_TAGS.length) * 60

  // 3. 缺失标签
  weakSynergies.push(...DESIRED_TAGS.filter(t => !tagSet.has(t)))

  // 4. 重复标签惩罚
  const tagCounts: Record<string, number> = {}
  tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 })
  const duplicatePenalty = Object.values(tagCounts)
    .filter(c => c > 2)
    .reduce((sum, c) => sum + (c - 2) * 5, 0)

  const score = Math.max(0, Math.round(diversityScore + synergyBonus - duplicatePenalty))

  return { score, strongSynergies, weakSynergies }
}
