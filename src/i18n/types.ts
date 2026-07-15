/**
 * i18n 类型定义
 */

import zhCN from './locales/zh-CN.json'

// 支持的语言类型（与 locales/ 下的文件一一对应）
export type Language = 'zh-CN' | 'zh-TW' | 'en'

// 递归把对象类型所有叶子字符串节点放宽为 string（避免字面量类型精度问题）
type StringValues<T> = {
  [K in keyof T]: T[K] extends string ? string : StringValues<T[K]>
}

// 翻译资源结构：从默认 locale（zh-CN）派生，key 与 json 自动同步，杜绝手写类型漂移。
// 跨语言 key 一致性由 i18nKeys.test.ts 运行时校验，不靠 satisfies（会被字面量精度卡住）。
export type TranslationResources = StringValues<typeof zhCN>
