const electron = require('electron')
const fs = require('fs')

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
      console.error('Export data error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  // 导入 BP 数据文件（schema 校验由 renderer 侧 loadSnapshot 负责）
  ipcMain.handle('import-data', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'BP Record', extensions: ['json'] }],
      })
      if (canceled || !filePaths.length) return { success: false, canceled: true }

      const raw = fsDep.readFileSync(filePaths[0], 'utf-8')
      const data = JSON.parse(raw)
      return { success: true, data }
    } catch (error) {
      console.error('Import data error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  console.log('Data handlers registered')
}

module.exports = { registerDataHandlers }
