// 英雄相关类型定义

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

export interface CounterInfo {
  strongAgainst: string[] // hero IDs
  weakAgainst: string[] // hero IDs
  synergies: string[] // hero IDs
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
