import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useBP } from './BPContext'

// 类型定义
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

  const [state, setState] = useState<DataState>({
    recommendations: [],
    synergyAnalysis: null,
    matchupAnalysis: null,
    loading: false,
  })

  // 分析 BP 数据
  const analyze = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      // 获取当前阶段
      const currentPhase = bp.getCurrentPhase()
      if (!currentPhase) {
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      // TODO: 实际分析逻辑
      const recommendations: Recommendation[] = []

      // TODO: 计算协同度
      const synergyAnalysis: SynergyScore = {
        score: 0,
        strongSynergies: [],
        weakSynergies: [],
      }

      // TODO: 计算对阵分析
      const matchupAnalysis: MatchupAnalysis = {
        winner: 'even',
        blueAdvantage: 50,
        redAdvantage: 50,
        keyFactors: [],
      }

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
  }, [bp])

  // 清除分析数据
  const clear = useCallback(() => {
    setState({
      recommendations: [],
      synergyAnalysis: null,
      matchupAnalysis: null,
      loading: false,
    })
  }, [])

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
