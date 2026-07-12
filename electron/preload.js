const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 英雄数据 API
  fetchHeroes: () => ipcRenderer.invoke('fetch-heroes'),
  getHeroImageUrl: (heroId) => ipcRenderer.invoke('get-hero-image-url', heroId),
  getCurrentVersion: () => ipcRenderer.invoke('get-current-version'),

  // 文件操作 API（待实现）
  exportData: (data) => ipcRenderer.invoke('export-data', data),
  importData: () => ipcRenderer.invoke('import-data'),

  // 平台信息
  platform: process.platform,
})
