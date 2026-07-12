// 测试 ESM 导入
console.log('Testing ESM imports...')

try {
  // Electron 30+ 可能使用 ESM
  const electron = require('electron/js2c/node_init')
  console.log('electron/js2c/node_init type:', typeof electron)
  console.log('exports:', Object.keys(electron))

  // 尝试访问 app
  if (electron.app) {
    console.log('electron.app:', electron.app)
  }
} catch (e) {
  console.error('ESM test failed:', e.message)
  console.error('Stack:', e.stack)
}
