/**
 * 全局类型定义
 */

import type { Hero } from './hero'

// Electron IPC 响应类型
export interface ElectronSuccessResponse<T> {
  success: true
  data: T
}

export interface ElectronErrorResponse {
  success: false
  error: string
}

export type ElectronResponse<T> = ElectronSuccessResponse<T> | ElectronErrorResponse

// 用户取消文件对话框（非错误，无 error 字段）
export interface ElectronCanceledResponse {
  success: false
  canceled: true
}

// Electron API 类型定义
export interface ElectronAPI {
  // 英雄数据 API
  fetchHeroes: () => Promise<ElectronResponse<Hero[]>>
  getHeroImageUrl: (heroId: string) => Promise<ElectronResponse<string>>
  getCurrentVersion: () => Promise<ElectronResponse<string>>

  // 文件操作 API
  exportData: (data: unknown) => Promise<ElectronResponse<{ filePath: string }> | ElectronCanceledResponse>
  importData: () => Promise<ElectronResponse<unknown> | ElectronCanceledResponse>

  // 平台信息
  platform: string
}

// 扩展 window 对象
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
