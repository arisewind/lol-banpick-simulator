// 英雄相关类型定义

// 英雄主流分路(数据源:src/data/championLanes.json,源自 LoL Wiki draft position)
export type Lane = 'top' | 'jungle' | 'mid' | 'bot' | 'support'

export interface Hero {
  id: string
  name: string
  title: string
  blurb: string
  image: {
    full: string
    sprite: string
    group: string
    x: number
    y: number
    w: number
    h: number
  }
  tags: string[]
  // 主流分路(映射表查不到时为空数组,表示该英雄无明确分路归类)
  lanes: Lane[]
  version: string
}

export interface HeroStats {
  id: string
  winRate: number
  pickRate: number
  banRate: number
  tier: string
  kda: number
}

export interface HeroWithStats extends Hero {
  stats?: HeroStats
}

// Data Dragon API 响应类型
export interface DataDragonResponse {
  type: string
  format: string
  version: string
  data: {
    [key: string]: {
      id: string
      name: string
      title: string
      blurb: string
      image: {
        full: string
        sprite: string
        group: string
        x: number
        y: number
        w: number
        h: number
      }
      tags: string[]
    }
  }
}
