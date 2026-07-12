// 测试 electron 环境
console.log('Node version:', process.version)
console.log('Platform:', process.platform)

try {
  console.log('Trying require("electron")...')
  const electron = require('electron')
  console.log('Electron loaded:', typeof electron)
  console.log('Electron keys:', Object.keys(electron))
} catch (e) {
  console.error('Error loading electron:', e.message)
}

// 检查是否有内置的 electron
try {
  console.log('Checking for built-in modules...')
  const builtin = require('module').builtinModules
  const electronModules = builtin.filter(m => m.includes('electron'))
  console.log('Electron-related modules:', electronModules)
} catch (e) {
  console.error('Error:', e.message)
}
