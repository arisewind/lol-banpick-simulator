/**
 * 类型保护函数 (Type Guards)
 * 用于运行时验证数据类型，消除类型断言的安全性风险
 */

import type { Hero } from '../types/hero'
import type { BPSnapshot, TeamState } from '../contexts/BPContext'

/**
 * 验证是否为有效的 Hero 对象
 */
export function isHero(data: unknown): data is Hero {
  if (typeof data !== 'object' || data === null) return false

  const hero = data as Record<string, unknown>
  return (
    typeof hero.id === 'string' &&
    typeof hero.name === 'string' &&
    typeof hero.title === 'string' &&
    typeof hero.blurb === 'string' &&
    typeof hero.image === 'object' &&
    hero.image !== null &&
    typeof hero.version === 'string' &&
    Array.isArray(hero.tags)
  )
}

/**
 * 验证 Hero 数组
 */
export function isHeroArray(data: unknown): data is Hero[] {
  if (!Array.isArray(data)) return false

  // 抽样验证（验证前10个或全部，取较小值）以提升性能
  const sampleSize = Math.min(data.length, 10)
  for (let i = 0; i < sampleSize; i++) {
    if (!isHero(data[i])) return false
  }
  return true
}

/**
 * 验证 TeamState 结构
 */
function isValidTeamState(data: unknown): data is TeamState {
  if (typeof data !== 'object' || data === null) return false

  const team = data as Record<string, unknown>
  return (
    Array.isArray(team.bans) &&
    Array.isArray(team.picks) &&
    team.bans.every((id: unknown) => typeof id === 'string') &&
    team.picks.every((id: unknown) => typeof id === 'string')
  )
}

/**
 * 验证 BPSnapshot 结构（已在 dataHandler.js 中有基础验证，此处为完整验证）
 */
export function isValidBPSnapshotRenderer(data: unknown): data is BPSnapshot {
  if (typeof data !== 'object' || data === null) return false

  const snap = data as Record<string, unknown>
  return (
    typeof snap.currentPhase === 'number' &&
    typeof snap.isComplete === 'boolean' &&
    isValidTeamState(snap.blueTeam) &&
    isValidTeamState(snap.redTeam) &&
    Array.isArray(snap.history) &&
    snap.history.every((entry: unknown) => typeof entry === 'object' && entry !== null)
  )
}
