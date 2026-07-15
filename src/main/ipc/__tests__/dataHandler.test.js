// 后端（Electron 主进程）IPC 契约测试：dataHandler
// 通过依赖注入 mock ipcMain/dialog/fs（绕开 require('electron') 在测试环境返回 path 字符串的问题）
// 断言 {success,data} / {success:false,error} / {success:false,canceled} 结构
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerDataHandlers } from '../dataHandler.js'

describe('dataHandler - registerDataHandlers', () => {
  let handlers, mockIpcMain, mockDialog, mockFs

  beforeEach(() => {
    vi.clearAllMocks()
    handlers = {}
    mockIpcMain = { handle: vi.fn((channel, fn) => { handlers[channel] = fn }) }
    mockDialog = { showSaveDialog: vi.fn(), showOpenDialog: vi.fn() }
    mockFs = { writeFileSync: vi.fn(), readFileSync: vi.fn() }
    registerDataHandlers({ ipcMain: mockIpcMain, dialog: mockDialog, fs: mockFs })
  })

  it('注册 export-data 与 import-data 两个 handler', () => {
    expect(mockIpcMain.handle).toHaveBeenCalledWith('export-data', expect.any(Function))
    expect(mockIpcMain.handle).toHaveBeenCalledWith('import-data', expect.any(Function))
  })

  describe('export-data', () => {
    it('用户选择路径后写入版本化 JSON 并返回 filePath', async () => {
      mockDialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/bp.json' })
      const result = await handlers['export-data']({}, { currentPhase: 7 })
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/tmp/bp.json',
        expect.stringContaining('"version": 1'),
        'utf-8',
      )
      expect(result).toEqual({ success: true, data: { filePath: '/tmp/bp.json' } })
    })

    it('用户取消时返回 canceled 且不写文件', async () => {
      mockDialog.showSaveDialog.mockResolvedValue({ canceled: true, filePath: undefined })
      const result = await handlers['export-data']({}, { currentPhase: 7 })
      expect(mockFs.writeFileSync).not.toHaveBeenCalled()
      expect(result).toEqual({ success: false, canceled: true })
    })

    it('writeFileSync 抛错时返回 error', async () => {
      mockDialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/bp.json' })
      mockFs.writeFileSync.mockImplementation(() => { throw new Error('disk full') })
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = await handlers['export-data']({}, { currentPhase: 7 })
      expect(result.success).toBe(false)
      expect(result.error).toBe('disk full')
      errSpy.mockRestore()
    })
  })

  describe('import-data', () => {
    it('读取并解析 JSON 返回 data', async () => {
      mockDialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/tmp/bp.json'] })
      mockFs.readFileSync.mockReturnValue('{"version":1,"currentPhase":7}')
      const result = await handlers['import-data']()
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ version: 1, currentPhase: 7 })
    })

    it('用户取消时返回 canceled', async () => {
      mockDialog.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] })
      const result = await handlers['import-data']()
      expect(result).toEqual({ success: false, canceled: true })
    })

    it('JSON 解析失败时返回 error', async () => {
      mockDialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/tmp/bp.json'] })
      mockFs.readFileSync.mockReturnValue('not json')
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = await handlers['import-data']()
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
      errSpy.mockRestore()
    })
  })
})
