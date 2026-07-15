import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useBP } from './BPContext'
import { useHeroes } from './HeroContext'
import { calcSynergy } from '../analysis/rules/synergy'
import { calcMatchup } from '../analysis/rules/matchup'
import { recommendHeroes } from '../analysis/rules/recommend'
import type { Recommendation, SynergyScore, MatchupAnalysis } from '../analysis/types'

// 重新导出类型，保持向后兼容
export type { Recommendation, SynergyScore, MatchupAnalysis }

interface DataState {
  recommendations: Recommendation[]
  synergyAnalysis: SynergyScore | null
  matchupAnalysis: MatchupAnalysis | null
  loading: boolean
}

interface DataContextValue extends DataState {
  analyze: () => Promise<void>
  clear: () => void
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const bp = useBP()
  const { heroes } = useHeroes()

  const [state, setState] = useState<DataState>({
    recommendations: [],
    synergyAnalysis: null,
    matchupAnalysis: null,
    loading: false,
  })

  // 分析 BP 数据（本地规则引擎：协同度 / 对阵优势 / 推荐）
  const analyze = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      const currentPhase = bp.getCurrentPhase()
      if (!currentPhase) {
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      // 按 id 从英雄池匹配完整英雄对象（含 tags）
      const getHeroesByIds = (ids: string[]) =>
        ids
          .map(id => heroes.find(h => h.id === id))
          .filter((h): h is NonNullable<typeof h> => h != null)

      const bluePicks = getHeroesByIds(bp.blueTeam.picks)
      const redPicks = getHeroesByIds(bp.redTeam.picks)

      // 当前选人方为"己方"，对方为"敌方"
      const ownPicks = currentPhase.side === 'blue' ? bluePicks : redPicks
      const enemyPicks = currentPhase.side === 'blue' ? redPicks : bluePicks

      const excludedIds = [
        ...bp.blueTeam.bans, ...bp.redTeam.bans,
        ...bp.blueTeam.picks, ...bp.redTeam.picks,
      ]

      const recommendations = recommendHeroes(heroes, ownPicks, enemyPicks, excludedIds)
      const synergyAnalysis = calcSynergy(ownPicks)
      const matchupAnalysis = calcMatchup(bluePicks, redPicks)

      setState(prev => ({
        ...prev,
        recommendations,
        synergyAnalysis,
        matchupAnalysis,
        loading: false,
      }))
    } catch (error) {
      console.error('Analysis error:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [bp, heroes])

  // 清除分析数据
  const clear = useCallback(() => {
    setState({
      recommendations: [],
      synergyAnalysis: null,
      matchupAnalysis: null,
      loading: false,
    })
  }, [])

  // BP 状态变化（ban/pick/undo/reset）时清除旧分析，避免残留过时推荐
  useEffect(() => {
    clear()
  }, [bp.currentPhase, bp.history.length, clear])

  const value: DataContextValue = {
    ...state,
    analyze,
    clear,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export default DataProvider
