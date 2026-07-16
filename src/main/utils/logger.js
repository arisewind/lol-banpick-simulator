/**
 * 统一日志工具（Electron 主进程）
 * 仅在开发环境输出 info/debug 日志，生产环境只保留 error/warn
 */

const isDev = process.env.NODE_ENV === 'development' || !!process.env.ELECTRON_IS_DEV

const logger = {
  /** 普通信息日志（仅开发环境） */
  info: (...args) => {
    if (isDev) {
      console.log('[INFO]', ...args)
    }
  },

  /** 调试日志（仅开发环境） */
  debug: (...args) => {
    if (isDev) {
      console.debug('[DEBUG]', ...args)
    }
  },

  /** 警告日志（始终输出） */
  warn: (...args) => {
    console.warn('[WARN]', ...args)
  },

  /** 错误日志（始终输出） */
  error: (...args) => {
    console.error('[ERROR]', ...args)
  },
}

module.exports = { logger }
