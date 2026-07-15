import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import en from './locales/en.json'

// 导出类型供其他模块使用
export type { Language, TranslationResources } from './types'

// 初始化 i18next
i18n
  .use(initReactI18next) // 绑定 react-i18next
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW },
      'en': { translation: en }
    },
    lng: 'zh-CN', // 默认语言为简体中文
    fallbackLng: 'zh-CN', // 回退语言
    interpolation: {
      escapeValue: false // React 已经防止 XSS
    },
    react: {
      useSuspense: false // 关键设置为 false，避免需要 Suspense 包裹
    }
  })

// 移除未使用的默认导出（文件作为副作用导入用于初始化 i18next）
