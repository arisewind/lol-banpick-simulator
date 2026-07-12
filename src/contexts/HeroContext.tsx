import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { Hero, HeroStats } from '../types/hero'

export interface HeroWithStats extends Hero {
  stats?: HeroStats
}

interface HeroState {
  heroes: HeroWithStats[]
  loading: boolean
  error: string | null
  filteredHeroes: HeroWithStats[]
  searchQuery: string
  selectedTags: string[]
  availableTags: string[]
}

interface HeroContextValue extends HeroState {
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
    filteredHeroes: [],
    searchQuery: '',
    selectedTags: [],
    availableTags: [],
  })

  // 过滤英雄 - 直接在setState中计算，避免依赖问题
  const updateFilteredHeroes = useCallback((searchQuery: string, selectedTags: string[], heroes: HeroWithStats[]) => {
    let filtered = [...heroes]

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        hero =>
          hero.name.toLowerCase().includes(query) ||
          hero.title.toLowerCase().includes(query)
      )
    }

    // 标签过滤 - 必须同时满足所有选中的标签（AND逻辑），还是满足任一标签（OR逻辑）？
    // 这里使用OR逻辑，满足任一标签即可
    if (selectedTags.length > 0) {
      filtered = filtered.filter(hero =>
        selectedTags.some(tag => hero.tags.includes(tag))
      )
    }

    return filtered
  }, [])

  // 搜索查询
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      filteredHeroes: updateFilteredHeroes(query, prev.selectedTags, prev.heroes)
    }))
  }, [updateFilteredHeroes])

  // 标签选择
  const setSelectedTags = useCallback((tags: string[]) => {
    setState(prev => ({
      ...prev,
      selectedTags: tags,
      filteredHeroes: updateFilteredHeroes(prev.searchQuery, tags, prev.heroes)
    }))
  }, [updateFilteredHeroes])

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

        setState(prev => {
          // 计算过滤后的英雄列表
          let filtered = [...heroes]
          if (prev.searchQuery) {
            const query = prev.searchQuery.toLowerCase()
            filtered = filtered.filter(
              hero =>
                hero.name.toLowerCase().includes(query) ||
                hero.title.toLowerCase().includes(query)
            )
          }
          if (prev.selectedTags.length > 0) {
            filtered = filtered.filter(hero =>
              prev.selectedTags.some(tag => hero.tags.includes(tag))
            )
          }

          return {
            ...prev,
            heroes,
            filteredHeroes: filtered,
            availableTags,
            loading: false,
          }
        })
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
    ...state,
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
