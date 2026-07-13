/**
 * i18n 类型定义
 */

// 支持的语言类型
export type Language = 'zh-CN' | 'zh-TW' | 'en' | 'ko'

// 翻译资源结构
export interface TranslationResources {
  common: {
    confirm: string
    cancel: string
    save: string
    undo: string
    reset: string
    export: string
    import: string
    search: string
    loading: string
    error: string
  }
  bp: {
    ban: string
    pick: string
    blueTeam: string
    redTeam: string
    banPhase: string
    pickPhase: string
    phase: string
    complete: string
  }
  hero: {
    tags: {
      assassin: string
      fighter: string
      mage: string
      marksman: string
      support: string
      tank: string
    }
    selectToBan: string
    selectToPick: string
    alreadySelected: string
  }
  stats: {
    totalHeroes: string
    filteredHeroes: string
  }
}

// 默认导出类型用于 i18next
export default null
