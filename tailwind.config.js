/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // LoL 电竞风格配色 - 参考设计标准
        'lol-blue': '#0066CC',        // 蓝队主色
        'lol-blue-dark': '#1E3A8A',   // 蓝队深色
        'lol-blue-light': '#3B82F6',  // 蓝队高亮
        'lol-red': '#CC0000',         // 红队主色
        'lol-red-dark': '#991B1B',    // 红队深色
        'lol-red-light': '#EF4444',   // 红队高亮
        'lol-purple': '#6A0DAD',      // 中央分隔色
        'lol-gold': '#FFD700',        // 金色强调
        'lol-gold-light': '#FFED4E',  // 金色高亮
        // 背景色
        'lol-bg-dark': '#1A1A1A',    // 深灰背景
        'lol-bg-black': '#1E1E1E',   // 更深背景
        // 文字色
        'lol-text-primary': '#FFFFFF',
        'lol-text-secondary': '#CCCCCC',
        'lol-text-muted': '#6B7280',
        // 分割线
        'lol-border': '#333333',
      },
      boxShadow: {
        // 注意：自定义 boxShadow 不支持 Tailwind 的透明度修饰符
        // （shadow-blue/40 会被误解析为阴影颜色染色），故为每档单独定义 key
        // 电竞风格 - 参考设计配色
        'blue-sm': '0 0 15px rgba(0, 102, 204, 0.3)',
        'blue': '0 0 25px rgba(0, 102, 204, 0.5)',
        'blue-lg': '0 0 40px rgba(0, 102, 204, 0.7)',
        'blue-xl': '0 0 60px rgba(0, 102, 204, 0.9)',
        'blue-2xl': '0 0 80px rgba(0, 102, 204, 1)',
        'red-sm': '0 0 15px rgba(204, 0, 0, 0.3)',
        'red': '0 0 25px rgba(204, 0, 0, 0.5)',
        'red-lg': '0 0 40px rgba(204, 0, 0, 0.7)',
        'red-xl': '0 0 60px rgba(204, 0, 0, 0.9)',
        'red-2xl': '0 0 80px rgba(204, 0, 0, 1)',
        'purple': '0 0 30px rgba(106, 13, 173, 0.6)',
        'purple-lg': '0 0 50px rgba(106, 13, 173, 0.8)',
        'purple-xl': '0 0 70px rgba(106, 13, 173, 1)',
        'gold-sm': '0 0 15px rgba(255, 215, 0, 0.3)',
        'gold': '0 0 20px rgba(255, 215, 0, 0.5)',
        'gold-lg': '0 0 35px rgba(255, 215, 0, 0.7)',
        'gold-xl': '0 0 50px rgba(255, 215, 0, 0.9)',
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
