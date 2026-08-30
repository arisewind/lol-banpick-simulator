import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react'
import type { HeroWithStats, Lane } from '../types/hero'
import { isHeroArray } from '../utils/typeGuards'

// 五个分路常量(固定,不需从数据动态聚合)
export const LANES: Lane[] = ['top', 'jungle', 'mid', 'bot', 'support']

interface HeroState {
  heroes: HeroWithStats[]
  loading: boolean
  error: string | null
  searchQuery: string
  selectedLanes: Lane[]
}

interface HeroContextValue {
  heroes: HeroWithStats[]
  loading: boolean
  error: string | null
  filteredHeroes: HeroWithStats[]
  searchQuery: string
  selectedLanes: Lane[]
  availableLanes: Lane[]
  setSearchQuery: (query: string) => void
  setSelectedLanes: (lanes: Lane[]) => void
  getHeroById: (id: string) => HeroWithStats | undefined
  refreshHeroes: () => Promise<void>
}

const HeroContext = createContext<HeroContextValue | undefined>(undefined)

export function HeroProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HeroState>({
    heroes: [],
    loading: true,
    error: null,
    searchQuery: '',
    selectedLanes: [],
  })

  // 过滤英雄 - 使用 useMemo 优化性能
  const filteredHeroes = useMemo(() => {
    let filtered = [...state.heroes]

    // 搜索过滤
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      filtered = filtered.filter(
        hero =>
          hero.name.toLowerCase().includes(query) ||
          hero.title.toLowerCase().includes(query)
      )
    }

    // 分路过滤 - OR 逻辑，英雄属于任一选中分路即匹配
    if (state.selectedLanes.length > 0) {
      filtered = filtered.filter(hero =>
        state.selectedLanes.some(lane => hero.lanes?.includes(lane))
      )
    }

    return filtered
  }, [state.heroes, state.searchQuery, state.selectedLanes])

  // 搜索查询
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      // 只更新搜索查询，让 useMemo 处理过滤
    }))
  }, [])

  // 分路选择
  const setSelectedLanes = useCallback((lanes: Lane[]) => {
    setState(prev => ({
      ...prev,
      selectedLanes: lanes,
      // 只更新分路选择，让 useMemo 处理过滤
    }))
  }, [])

  // 获取英雄
  const getHeroById = useCallback(
    (id: string) => {
      return state.heroes.find(hero => hero.id === id)
    },
    [state.heroes]
  )

  // 刷新英雄数据
  const refreshHeroes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // 检查是否在 Electron 环境中
      if (!window.electronAPI) {
        throw new Error('请在 Electron 窗口中打开此应用（运行 pnpm electron:dev），不要直接在浏览器中打开')
      }

      // 通过 Electron API 获取英雄数据
      const result = await window.electronAPI.fetchHeroes()

      if (result.success && result.data) {
        // 运行时类型检查：确保数据格式正确
        if (!isHeroArray(result.data)) {
          throw new Error('英雄数据格式无效')
        }
        const heroes = result.data

        setState(prev => ({
          ...prev,
          heroes,
          loading: false,
        }))
      } else {
        // 请求失败，抛出错误
        const errorMessage = (result as { error?: string }).error || '获取英雄数据失败'
        throw new Error(errorMessage)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '获取英雄数据失败',
      }))
    }
  }, [])

  // 组件挂载时加载英雄数据
  useEffect(() => {
    refreshHeroes()
  }, [refreshHeroes])

  const value: HeroContextValue = {
    heroes: state.heroes,
    loading: state.loading,
    error: state.error,
    filteredHeroes,
    searchQuery: state.searchQuery,
    selectedLanes: state.selectedLanes,
    availableLanes: LANES,
    setSearchQuery,
    setSelectedLanes,
    getHeroById,
    refreshHeroes,
  }

  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>
}

export function useHeroes() {
  const context = useContext(HeroContext)
  if (context === undefined) {
    throw new Error('useHeroes must be used within a HeroProvider')
  }
  return context
}

// 已移除默认导出，统一使用命名导出
