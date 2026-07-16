const { ipcMain } = require('electron')
const { heroService } = require('../services/heroService.js')
const { logger } = require('../utils/logger.js')

/**
 * 注册英雄相关的 IPC 处理器
 */
function registerHeroHandlers() {
  // 获取英雄列表
  ipcMain.handle('fetch-heroes', async () => {
    try {
      const heroes = await heroService.fetchHeroes()
      return { success: true, data: heroes }
    } catch (error) {
      logger.error('Fetch heroes error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  // 获取英雄图片 URL
  ipcMain.handle('get-hero-image-url', async (event, heroId) => {
    try {
      const url = heroService.getHeroImageUrl(heroId)
      return { success: true, data: url }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  // 获取当前版本
  ipcMain.handle('get-current-version', async () => {
    try {
      const version = await heroService.getCurrentVersion()
      return { success: true, data: version }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  logger.info('Hero handlers registered')
}

module.exports = { registerHeroHandlers }
