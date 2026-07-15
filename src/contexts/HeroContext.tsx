import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react'
import type { Hero, HeroWithStats } from '../types/hero'

interface HeroState {
  heroes: HeroWithStats[]
  loading: boolean
  error: string | null
  searchQuery: string
  selectedTags: string[]
  availableTags: string[]
}

interface HeroContextValue {
  heroes: HeroWithStats[]
  loading: boolean
  error: string | null
  filteredHeroes: HeroWithStats[]
  searchQuery: string
  selectedTags: string[]
  availableTags: string[]
  setSearchQuery: (query: string) => void
  setSelectedTags: (tags: string[]) => void
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
    selectedTags: [],
    availableTags: [],
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

    // 标签过滤 - OR 逻辑，满足任一标签即可
    if (state.selectedTags.length > 0) {
      filtered = filtered.filter(hero =>
        state.selectedTags.some(tag => hero.tags.includes(tag))
      )
    }

    return filtered
  }, [state.heroes, state.searchQuery, state.selectedTags])

  // 搜索查询
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      // 只更新搜索查询，让 useMemo 处理过滤
    }))
  }, [])

  // 标签选择
  const setSelectedTags = useCallback((tags: string[]) => {
    setState(prev => ({
      ...prev,
      selectedTags: tags,
      // 只更新标签，让 useMemo 处理过滤
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
      // 通过 Electron API 获取英雄数据
      const result = await window.electronAPI.fetchHeroes()

      if (result.success && result.data) {
        const heroes = result.data as Hero[]

        // 提取所有标签
        const tagsSet = new Set<string>()
        heroes.forEach((hero) => {
          hero.tags.forEach((tag) => tagsSet.add(tag))
        })
        const availableTags = Array.from(tagsSet).sort()

        setState(prev => ({
          ...prev,
          heroes,
          availableTags,
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
    selectedTags: state.selectedTags,
    availableTags: state.availableTags,
    setSearchQuery,
    setSelectedTags,
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

export default HeroProvider
