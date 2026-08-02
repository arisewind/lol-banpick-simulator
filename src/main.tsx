import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// 游戏字体(@fontsource 本地 woff2,Electron 离线可用)
// Orbitron:标题/数字/队名;Rajdhani:正文/HUD;Chakra Petch:备选科技感
import '@fontsource/orbitron/500.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/orbitron/900.css'
import '@fontsource/rajdhani/400.css'
import '@fontsource/rajdhani/500.css'
import '@fontsource/rajdhani/600.css'
import '@fontsource/rajdhani/700.css'
import './styles/globals.css'
import './i18n' // 导入 i18n 配置

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
