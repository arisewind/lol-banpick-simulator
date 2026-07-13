/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 英雄联盟游戏风格配色
        'lol-blue': '#0ac8b9',
        'lol-blue-glow': '#00d4ff',
        'lol-blue-dark': '#08a094',
        'lol-red': '#f2385b',
        'lol-red-glow': '#ff5c7c',
        'lol-red-dark': '#c92641',
        'lol-gold': '#c8aa6e',
        'lol-gold-glow': '#ffd700',
        'lol-dark': '#091428',
        'lol-darker': '#010a13',
      },
      boxShadow: {
        // 注意：自定义 boxShadow 不支持 Tailwind 的透明度修饰符
        // （shadow-blue/40 会被误解析为阴影颜色染色），故为每档单独定义 key
        'blue-sm': '0 0 12px rgba(10, 200, 185, 0.15)',
        'blue': '0 0 20px rgba(10, 200, 185, 0.4)',
        'blue-lg': '0 0 30px rgba(10, 200, 185, 0.5)',
        'red-sm': '0 0 12px rgba(242, 56, 91, 0.15)',
        'red': '0 0 20px rgba(242, 56, 91, 0.4)',
        'red-lg': '0 0 30px rgba(242, 56, 91, 0.5)',
        'gold-sm': '0 0 12px rgba(200, 170, 110, 0.15)',
        'gold': '0 0 20px rgba(200, 170, 110, 0.3)',
        'gold-lg': '0 0 30px rgba(200, 170, 110, 0.4)',
      },
      animation: {
        'border': 'border-flow 3s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
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
