const electron = require('electron')
const fs = require('fs')
const { logger } = require('../utils/logger.js')

/**
 * 安全常量
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const SUPPORTED_VERSIONS = [1]

/**
 * 验证 BP 数据快照结构（基础安全检查）
 * @param {unknown} data - 待验证的数据
 * @returns {boolean} 是否有效
 */
function isValidBPSnapshot(data) {
  if (typeof data !== 'object' || data === null) return false

  const snap = data
  // 版本号检查
  if (typeof snap.version !== 'number' || !SUPPORTED_VERSIONS.includes(snap.version)) {
    return false
  }
  // 必需字段类型检查
  if (typeof snap.currentPhase !== 'number') return false
  if (typeof snap.isComplete !== 'boolean') return false

  // 验证 TeamState 结构：{ bans: string[], picks: string[] }
  const isValidTeamState = (team) => {
    if (typeof team !== 'object' || team === null) return false
    return Array.isArray(team.bans) && Array.isArray(team.picks)
  }

  if (!isValidTeamState(snap.blueTeam) || !isValidTeamState(snap.redTeam)) return false
  if (!Array.isArray(snap.history)) return false

  return true
}

/**
 * 注册文件导入导出相关的 IPC 处理器
 * 数据格式版本化：{ version: 1, currentPhase, blueTeam, redTeam, history, isComplete, exportedAt }
 *
 * @param {object} [deps] 依赖注入（测试用）；生产环境省略，自动取 electron / fs
 */
function registerDataHandlers(deps) {
  const { ipcMain, dialog, fs: fsDep } = deps || {
    ipcMain: electron.ipcMain,
    dialog: electron.dialog,
    fs: fs,
  }

  // 导出 BP 数据到文件
  ipcMain.handle('export-data', async (_event, data) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: `bp-record-${Date.now()}.json`,
        filters: [{ name: 'BP Record', extensions: ['json'] }],
      })
      if (canceled || !filePath) return { success: false, canceled: true }

      // 时间戳由 renderer 传入（exportedAt），主进程不自行生成数据时间
      fsDep.writeFileSync(filePath, JSON.stringify({ version: 1, ...data }, null, 2), 'utf-8')
      return { success: true, data: { filePath } }
    } catch (error) {
      logger.error('Export data error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  // 导入 BP 数据文件（主进程侧基础验证 + 完整校验由 renderer 侧 loadSnapshot 负责）
  ipcMain.handle('import-data', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'BP Record', extensions: ['json'] }],
      })
      if (canceled || !filePaths.length) return { success: false, canceled: true }

      // 安全检查 1: 文件大小限制（防止内存溢出攻击）
      const stats = fsDep.statSync(filePaths[0])
      if (stats.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
        }
      }

      // 安全检查 2: 读取并解析 JSON
      const raw = fsDep.readFileSync(filePaths[0], 'utf-8')
      const data = JSON.parse(raw)

      // 安全检查 3: 基础结构验证（防止恶意数据注入）
      if (!isValidBPSnapshot(data)) {
        return {
          success: false,
          error: 'Invalid data format or unsupported version',
        }
      }

      return { success: true, data }
    } catch (error) {
      logger.error('Import data error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  logger.info('Data handlers registered')
}

module.exports = { registerDataHandlers }
