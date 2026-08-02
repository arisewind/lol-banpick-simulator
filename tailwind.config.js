/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // pickban.pro 风格配色 —— 金/品红双色对抗
        // 语义名保留(蓝方/红方),只换色值;组件层 class 字面量无需改动
        'lol-blue': '#FFD700',        // 蓝方主色 = 金(pickban.pro accent-primary)
        'lol-blue-dark': '#B8860B',   // 金色加深
        'lol-blue-light': '#FFED4E',  // 金色高亮
        'lol-red': '#ff00ff',         // 红方主色 = 品红(pickban.pro accent-secondary #f0f)
        'lol-red-dark': '#a300a3',    // 品红加深
        'lol-red-light': '#ff4dff',   // 品红高亮
        'lol-purple': '#5600b3',      // 第三强调色(pickban.pro accent-tertiary,深紫)
        'lol-gold': '#FFD700',        // 金色强调(与蓝方色重合,语义不同)
        'lol-gold-light': '#FFED4E',  // 金色高亮
        // 背景色系 —— 纯黑深色主题(pickban.pro bg 层级)
        'lol-bg-dark': '#101010',     // 主背景(pickban.pro --bg-primary)
        'lol-bg-secondary': '#1a1a1a',// 按钮/卡片默认背景(pickban.pro --bg-primary-light-2)
        'lol-bg-card': '#202020',     // hover 卡片/输入框背景(pickban.pro --bg-primary-light-3)
        'lol-bg-black': '#050505',    // 更深背景(pickban.pro --bg-primary-dark-1)
        'lol-black': '#010a13',       // LOL 客户端原生深蓝黑(ban 空槽底色)
        // 文字色
        'lol-text-primary': '#FFFFFF',
        'lol-text-secondary': '#CCCCCC',
        'lol-text-muted': '#888888',  // 对齐 pickban.pro --text-faint
        // 分割线 / 边框
        'lol-border': '#303030',      // 对齐 pickban.pro --bg-primary-light
      },
      boxShadow: {
        // 注意:自定义 boxShadow 不支持 Tailwind 的透明度修饰符
        // (shadow-blue/40 会被误解析为阴影颜色染色),故为每档单独定义 key。
        //
        // pickban.pro 风格:偏移硬阴影(offset hard shadow),非柔光发光。
        // 原有 key 名保留(组件层 class 无需改),值统一改为纯黑偏移阴影。
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
