import type { Hero } from '../../types/hero'
import type { MatchupAnalysis } from '../types'
import { COUNTER_RULES } from './constants'

/**
 * 计算双方对阵优势（纯函数）
 * 按 tag 克制规则逐队计算：己方 tag 克制对方 tag 则加分。
 * 返回蓝/红胜率百分比（和为 100）与领先方。
 */
export function calcMatchup(bluePicks: Hero[], redPicks: Hero[]): MatchupAnalysis {
  if (bluePicks.length === 0 && redPicks.length === 0) {
    return { winner: 'even', blueAdvantage: 50, redAdvantage: 50, keyFactors: [] }
  }

  const blueTags = new Set(bluePicks.flatMap(h => h.tags))
  const redTags = new Set(redPicks.flatMap(h => h.tags))
  const keyFactors: string[] = []

  let blueScore = 0
  let redScore = 0

  // 蓝方克制红方
  for (const tag of blueTags) {
    for (const c of COUNTER_RULES[tag] || []) {
      if (redTags.has(c)) {
        blueScore += 10
        keyFactors.push(`蓝方 ${tag} 克制红方 ${c}`)
      }
    }
  }
  // 红方克制蓝方
  for (const tag of redTags) {
    for (const c of COUNTER_RULES[tag] || []) {
      if (blueTags.has(c)) {
        redScore += 10
        keyFactors.push(`红方 ${tag} 克制蓝方 ${c}`)
      }
    }
  }

  const total = blueScore + redScore
  let blueAdvantage: number
  let redAdvantage: number
  let winner: 'blue' | 'red' | 'even'

  if (total === 0) {
    blueAdvantage = 50
    redAdvantage = 50
    winner = 'even'
  } else {
    blueAdvantage = Math.round((blueScore / total) * 100)
    redAdvantage = 100 - blueAdvantage
    if (blueAdvantage > redAdvantage + 5) winner = 'blue'
    else if (redAdvantage > blueAdvantage + 5) winner = 'red'
    else winner = 'even'
  }

  return { winner, blueAdvantage, redAdvantage, keyFactors }
}
