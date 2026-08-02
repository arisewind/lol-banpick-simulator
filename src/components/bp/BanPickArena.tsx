import { useBP } from '../../contexts/BPContext'
import TeamSection from './TeamSection'
import HeroGrid from './HeroGrid'

/**
 * BP 主竞技场 - pickban.pro 三列横向范式
 * 左列(蓝方面板) | 中列(英雄选择区) | 右列(红方面板)
 * 整页固定一屏,仅中列英雄网格内部滚动。
 * 中列左右两侧各一条紫色细线作为蓝红视觉分隔(保留 .bg-lol-purple 元素)。
 */
export default function BanPickArena() {
  const { blueTeam, redTeam } = useBP()

  return (
    // 三列固定比例:蓝方 1fr | 英雄选择 1.8fr | 红方 1fr
    // 中列用 1.8fr(占比最大)且 minmax 兜底,避免被两侧 1fr 的 ban/pick 内容挤压变窄
    <div className="relative grid h-full grid-cols-[minmax(0,1fr)_minmax(420px,1.8fr)_minmax(0,1fr)] gap-x-2 overflow-hidden">
      {/* 左列:蓝方面板 */}
      <TeamSection side="blue" team={blueTeam} />

      {/* 中列:英雄选择区(min-h-0 防止内部网格撑破一屏;左右紫色细线分隔) */}
      <div className="relative h-full min-h-0 border-x border-lol-purple/30">
        {/* 顶部紫色装饰条(蓝红视觉分隔锚点) */}
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-lol-purple" aria-hidden="true" />
        <HeroGrid />
      </div>

      {/* 右列:红方面板 */}
      <TeamSection side="red" team={redTeam} />
    </div>
  )
}
