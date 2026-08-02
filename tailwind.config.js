/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 游戏字体(@fontsource 本地包,Electron 离线可用)
        display: ['Orbitron', 'sans-serif'],  // 标题/数字/队名,未来科幻感
        body: ['Rajdhani', 'sans-serif'],     // 正文/HUD,简洁紧凑
        hud: ['"Chakra Petch"', 'sans-serif'],// 备选科技感
      },
      colors: {
        // 原型 C 品牌渐变风格 —— 品牌蓝/红双色对抗 + 独立金色强调
        // 语义名保留(蓝方/红方),只换色值;组件层 class 字面量无需改动
        'lol-blue': '#1565C0',        // 蓝方主色 = 品牌蓝
        'lol-blue-dark': '#0D47A1',   // 品牌蓝加深
        'lol-blue-light': '#42A5F5',  // 品牌蓝高亮(发光态用)
        'lol-red': '#C62828',         // 红方主色 = 品牌红
        'lol-red-dark': '#B71C1C',    // 品牌红加深
        'lol-red-light': '#EF5350',   // 品牌红高亮(发光态用)
        'lol-purple': '#5600b3',      // 第三强调色(中列分隔,保留)
        'lol-gold': '#FFB300',        // 独立金色强调(原型 C 核心:与蓝方色分离)
        'lol-gold-light': '#FFCA28',  // 金色高亮
        // 背景色系 —— 深色主题(品牌渐变在组件层叠加)
        'lol-bg-dark': '#15151A',     // 主背景
        'lol-bg-secondary': '#1F1F28',// 按钮/卡片默认背景
        'lol-bg-card': '#25252F',     // hover 卡片/输入框背景
        'lol-bg-black': '#0A0A0F',    // 更深背景
        'lol-black': '#010a13',       // LOL 客户端原生深蓝黑(ban 空槽底色)
        // 文字色
        'lol-text-primary': '#FFFFFF',
        'lol-text-secondary': '#CCCCCC',
        'lol-text-muted': '#8A8A99',  // 中性灰
        // 分割线 / 边框
        'lol-border': '#2E2E3A',
      },
      boxShadow: {
        // 注意:自定义 boxShadow 不支持 Tailwind 的透明度修饰符
        // (shadow-blue/40 会被误解析为阴影颜色染色),故为每档单独定义 key。
        //
        // 偏移硬阴影(offset hard shadow),非柔光发光。
        // key 名保留(blue/red/gold/purple 各档),组件层 class 无需改动。
        // 强度递增体现在偏移量与模糊半径,而非彩色发光。
        'blue-sm': '1px 1px 3px 0 #000',
        'blue': '2px 2px 5px 0 #000',
        'blue-lg': '3px 3px 7px 1px #000',
        'blue-xl': '4px 4px 10px 2px #000',
        'blue-2xl': '5px 5px 14px 3px #000',
        'red-sm': '1px 1px 3px 0 #000',
        'red': '2px 2px 5px 0 #000',
        'red-lg': '3px 3px 7px 1px #000',
        'red-xl': '4px 4px 10px 2px #000',
        'red-2xl': '5px 5px 14px 3px #000',
        'purple': '2px 2px 5px 0 #000',
        'purple-lg': '3px 3px 7px 1px #000',
        'purple-xl': '4px 4px 10px 2px #000',
        'gold-sm': '1px 1px 3px 0 #000',
        'gold': '2px 2px 5px 0 #000',
        'gold-lg': '3px 3px 7px 1px #000',
        'gold-xl': '4px 4px 10px 2px #000',
        // 通用硬偏移阴影(pickban.pro 按钮规范)
        'hard': '2px 2px 5px 0 #000',     // 按钮默认
        'hard-hover': '1px 1px 5px 1px #000', // hover:偏移变小=抬起
        'hard-active': '1px 1px 0 0 #000',    // active:几乎无偏移=按下
        'hard-sm': '1px 1px 3px #000',
        // 内嵌阴影(输入框凹陷感、active tab)
        'inset-hard': 'inset 1px 1px 5px 1px #000',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-in-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scale-in': {
          'from': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
