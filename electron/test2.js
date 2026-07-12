// 测试 electron 主进程 API 导入
console.log('Testing different import methods...')

// 方法1: 直接 require electron
try {
  const electron1 = require('electron')
  console.log('Method 1 (require electron):', typeof electron1, electron1)
} catch (e) {
  console.error('Method 1 failed:', e.message)
}

// 方法2: 使用 electron/js2c/node_init
try {
  const electron2 = require('electron/js2c/node_init')
  console.log('Method 2 (node_init):', typeof electron2)
  console.log('Keys:', Object.keys(electron2))
} catch (e) {
  console.error('Method 2 failed:', e.message)
}

// 方法3: 解构导入
try {
  const { app, BrowserWindow } = require('electron')
  console.log('Method 3 (destructuring):', !!app, !!BrowserWindow)
} catch (e) {
  console.error('Method 3 failed:', e.message)
}

// 方法4: 从 node_init 解构
try {
  const { app, BrowserWindow } = require('electron/js2c/node_init')
  console.log('Method 4 (node_init destructuring):', !!app, !!BrowserWindow)
  if (app) {
    console.log('app.whenReady:', typeof app.whenReady)
  }
} catch (e) {
  console.error('Method 4 failed:', e.message)
}
