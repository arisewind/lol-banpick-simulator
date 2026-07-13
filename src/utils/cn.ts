/**
 * ClassName 组合工具函数
 * 用于条件性组合 Tailwind CSS 类名
 */

type ClassName = string | number | boolean | undefined | null
type ClassValue = ClassName | ClassArray | ClassDict

interface ClassArray extends Array<ClassValue> {}
interface ClassDict {
  [id: string]: boolean | undefined | null
}

/**
 * 组合多个类名
 */
export function cn(...classes: ClassValue[]): string {
  const result: string[] = []

  for (const value of classes) {
    if (!value) continue

    if (typeof value === 'string') {
      result.push(value)
    } else if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) result.push(nested)
    } else if (typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        if (val) result.push(key)
      }
    }
  }

  return result.join(' ')
}
