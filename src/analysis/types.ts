// 数据分析模块共享类型

export interface Recommendation {
  heroId: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  winRate?: number
}

export interface SynergyScore {
  score: number
  strongSynergies: string[]
  weakSynergies: string[]
}

export interface MatchupAnalysis {
  winner: 'blue' | 'red' | 'even'
  blueAdvantage: number
  redAdvantage: number
  keyFactors: string[]
}
