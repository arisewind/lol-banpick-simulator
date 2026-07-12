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
        'lol-red': '#f2385b',
        'lol-gold': '#c8aa6e',
        'lol-dark': '#091428',
        'lol-darker': '#010a13',
      },
    },
  },
  plugins: [],
}
