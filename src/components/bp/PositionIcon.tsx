import type { Lane } from '../../types/hero'
import { cn } from '../../utils/cn'

export interface PositionIconProps {
  lane: Lane
  className?: string
  title?: string
}

/**
 * 分路位置图标 —— 直接内联 LOL 官方客户端图标(Community Dragon
 * rcp-fe-lol-static-assets/global/default/svg/position-*.svg)。
 *
 * 这是排位选位置时游戏内显示的那套金色折角图标,每个分路用 L 形/折角
 * 几何表示其在 Summoner's Rift 地图上的方位区域。
 *
 * 原始配色:#c8aa6e(亮金,主体 .active)+ #785a28(暗金,背景半透明)。
 * 此处改为 currentColor:主体 path 用 currentColor(满亮度),
 * 背景装饰 path 用 currentColor + opacity-50,让明暗对比由父按钮控制
 * (未选暗灰、选中亮白/亮金)。
 *
 * utility lane 对应游戏内的"辅助"位置(官方分类名)。
 *
 * viewBox 0 0 34 34,所有 path/polygon 坐标原样照抄官方 SVG,不改几何。
 */
export default function PositionIcon({ lane, className, title }: PositionIconProps) {
  return (
    <svg
      viewBox="0 0 34 34"
      fill="currentColor"
      className={cn('h-6 w-6', className)}
      role="img"
      aria-label={title ?? lane}
      aria-hidden={title ? undefined : true}
    >
      {lane === 'top' && (
        <>
          <path opacity="0.5" fillRule="evenodd" d="M21,14H14v7h7V14Zm5-3V26L11.014,26l-4,4H30V7.016Z" />
          <polygon points="4 4 4.003 28.045 9 23 9 9 23 9 28.045 4.003 4 4" />
        </>
      )}
      {lane === 'jungle' && (
        <path fillRule="evenodd" d="M25,3c-2.128,3.3-5.147,6.851-6.966,11.469A42.373,42.373,0,0,1,20,20a27.7,27.7,0,0,1,1-3C21,12.023,22.856,8.277,25,3ZM13,20c-1.488-4.487-4.76-6.966-9-9,3.868,3.136,4.422,7.52,5,12l3.743,3.312C14.215,27.917,16.527,30.451,17,31c4.555-9.445-3.366-20.8-8-28C11.67,9.573,13.717,13.342,13,20Zm8,5a15.271,15.271,0,0,1,0,2l4-4c0.578-4.48,1.132-8.864,5-12C24.712,13.537,22.134,18.854,21,25Z" />
      )}
      {lane === 'mid' && (
        <>
          <path opacity="0.5" fillRule="evenodd" d="M30,12.968l-4.008,4L26,26H17l-4,4H30ZM16.979,8L21,4H4V20.977L8,17,8,8h8.981Z" />
          <polygon points="25 4 4 25 4 30 9 30 30 9 30 4 25 4" />
        </>
      )}
      {lane === 'bot' && (
        <>
          <path opacity="0.5" fillRule="evenodd" d="M13,20h7V13H13v7ZM4,4V26.984l3.955-4L8,8,22.986,8l4-4H4Z" />
          <polygon points="29.997 5.955 25 11 25 25 11 25 5.955 29.997 30 30 29.997 5.955" />
        </>
      )}
      {lane === 'support' && (
        <path fillRule="evenodd" d="M26,13c3.535,0,8-4,8-4H23l-3,3,2,7,5-2-3-4h2ZM22,5L20.827,3H13.062L12,5l5,6Zm-5,9-1-1L13,28l4,3,4-3L18,13ZM11,9H0s4.465,4,8,4h2L7,17l5,2,2-7Z" />
      )}
    </svg>
  )
}
