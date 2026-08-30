import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useBP } from '../../contexts/BPContext'
import type { TeamState, TeamSide } from '../../contexts/BPContext'
import { cn } from '../../utils/cn'
import TeamSlot from './TeamSlot'

interface TeamSectionProps {
  side: TeamSide
  team: TeamState
}

/**
 * 把 BP_PHASES 的 step 映射成"哪一队的第几个 ban/pick 槽"。
 * 返回 null 表示当前无活跃槽(BP 结束或 step 不在本队)。
 *
 * 映射依据 BP_PHASES 顺序(见 BPContext):
 *   ban 阶段1(step1-6): 蓝方 bans[0,1,2]=step1,3,5; 红方 bans[0,1,2]=step2,4,6
 *   pick 阶段1(step7-12): 蓝方 picks[0,1,2]=step7,10,11; 红方 picks[0,1,2]=step8,9,12
 *   ban 阶段2(step13-16): 蓝方 bans[3,4]=step14,16; 红方 bans[3,4]=step13,15
 *   pick 阶段2(step17-20): 蓝方 picks[3,4]=step18,19; 红方 picks[3,4]=step17,20
 */
const STEP_TO_SLOT: Record<number, { side: TeamSide; type: 'ban' | 'pick'; slot: number }> = {
  1:  { side: 'blue', type: 'ban',  slot: 0 },
  2:  { side: 'red',  type: 'ban',  slot: 0 },
  3:  { side: 'blue', type: 'ban',  slot: 1 },
  4:  { side: 'red',  type: 'ban',  slot: 1 },
  5:  { side: 'blue', type: 'ban',  slot: 2 },
  6:  { side: 'red',  type: 'ban',  slot: 2 },
  7:  { side: 'blue', type: 'pick', slot: 0 },
  8:  { side: 'red',  type: 'pick', slot: 0 },
  9:  { side: 'red',  type: 'pick', slot: 1 },
  10: { side: 'blue', type: 'pick', slot: 1 },
  11: { side: 'blue', type: 'pick', slot: 2 },
  12: { side: 'red',  type: 'pick', slot: 2 },
  13: { side: 'red',  type: 'ban',  slot: 3 },
  14: { side: 'blue', type: 'ban',  slot: 3 },
  15: { side: 'red',  type: 'ban',  slot: 4 },
  16: { side: 'blue', type: 'ban',  slot: 4 },
  17: { side: 'red',  type: 'pick', slot: 3 },
  18: { side: 'blue', type: 'pick', slot: 3 },
  19: { side: 'blue', type: 'pick', slot: 4 },
  20: { side: 'red',  type: 'pick', slot: 4 },
}

/**
 * 单支队伍面板 - pickban.pro 穿插排列范式
 * ban/pick 按真实 LPL/LCK BP 流程穿插竖向堆叠:
 *   ban-row-1(3 个横排) → pick×3(竖向) → ban-row-2(2 个横排) → pick×2(竖向)
 *
 * 穿插索引映射(基于 BP_PHASES 时间顺序):
 *   bans[0,1,2] = 第一阶段 ban(step 1-6 每队各 3 个)
 *   picks[0,1,2] = 第一阶段 pick(step 7-12 每队各 3 个)
 *   bans[3,4] = 第二阶段 ban(step 13-16 每队各 2 个)
 *   picks[3,4] = 第二阶段 pick(step 17-20 每队各 2 个)
 *
 * 蓝方为蓝队,红方为红队,颜色用字面量三元切换(遵循 Tailwind JIT 字面量约束)。
 * 镜像(side==='blue')传给 TeamSlot,由 pick 槽做 scaleX(-1) 镜像。
 */
function TeamSection({ side, team }: TeamSectionProps) {
  const { t } = useTranslation()
  const { getCurrentPhase, currentPhase, swapPicks } = useBP()
  const isBlue = side === 'blue'

  // pick 交换交互(学 DraftLoL):点第一个已选 pick 槽选中为源,再点同队另一个完成交换,
  // 点源槽自身取消。仅本队 pick 槽参与,bans 不参与交换。
  const [swapSource, setSwapSource] = useState<number | null>(null)

  // BP 推进/撤销/重置时收起未完成的交换选择,避免悬空状态跨步残留
  useEffect(() => {
    setSwapSource(null)
  }, [currentPhase])

  const handlePickSlotClick = (slotIndex: number) => {
    if (swapSource === null) {
      setSwapSource(slotIndex)
      return
    }
    if (swapSource === slotIndex) {
      setSwapSource(null)
      return
    }
    swapPicks(side, swapSource, slotIndex)
    setSwapSource(null)
  }

  // 算出当前活跃槽(供呼吸动效):若当前 step 轮到本队的某 ban/pick 槽,标记它
  const activeSlot = (() => {
    const phase = getCurrentPhase()
    if (!phase) return null
    const mapping = STEP_TO_SLOT[phase.step]
    if (!mapping || mapping.side !== side) return null
    return mapping // { type, slot }
  })()

  // 穿插切片:按 BP 流程顺序取对应槽位,空位补 null
  const banPhase1 = [team.bans[0], team.bans[1], team.bans[2]]          // 3 个 ban(第一阶段)
  const pickPhase1 = [team.picks[0], team.picks[1], team.picks[2]]      // 3 个 pick(第一阶段)
  const banPhase2 = [team.bans[3], team.bans[4]]                        // 2 个 ban(第二阶段)
  const pickPhase2 = [team.picks[3], team.picks[4]]                     // 2 个 pick(第二阶段)

  // C 风格核心:两侧品牌色渐变铺底(蓝方蓝→黑,红方红→黑)
  // 用 Tailwind token + 透明度修饰符,避免硬编码 rgba 与 tailwind.config 色值漂移
  const panelBg = isBlue
    ? 'bg-gradient-to-br from-lol-blue/30 via-lol-blue/5 to-transparent'
    : 'bg-gradient-to-bl from-lol-red/30 via-lol-red/5 to-transparent'

  return (
    <div className={cn('flex h-full min-h-0 flex-col gap-2 px-4 py-3', panelBg)}>
      {/* 队名标签(C 风格:半透明黑底圆角条) */}
      <div className={cn(
        'flex shrink-0 items-center gap-2 rounded-md bg-black/30 px-3 py-2',
      )}>
        <div className={cn(
          'h-2.5 w-2.5 rounded-full',
          isBlue ? 'bg-lol-blue-light' : 'bg-lol-red-light',
        )} />
        <h2 className={cn(
          'font-display text-sm font-bold uppercase tracking-widest',
          isBlue ? 'text-lol-blue-light' : 'text-lol-red-light',
        )}>
          {t(`bp.${side}Team`)}
        </h2>
      </div>

      {/* ban-row-1:3 个 ban 槽横排(方案A:flex 左对齐,槽固定 64px,gap 6px,两组 ban 净距完全一致) */}
      <div className="flex h-16 shrink-0 items-center gap-[6px]">
        {banPhase1.map((heroId, i) => (
          <TeamSlot key={`b1-${i}`} heroId={heroId ?? null} type="ban" side={side} index={i} mirrored={isBlue}
            isActive={activeSlot?.type === 'ban' && activeSlot.slot === i} />
        ))}
      </div>

      {/* pick ×3:竖向堆叠,每个 flex-1 瓜分剩余高度(横向 banner 形态,配 splash 横版原画) */}
      <div className="flex min-h-0 flex-1 flex-col gap-[5px]">
        {pickPhase1.map((heroId, i) => (
          <TeamSlot key={`p1-${i}`} heroId={heroId ?? null} type="pick" side={side} index={i} mirrored={isBlue}
            isActive={activeSlot?.type === 'pick' && activeSlot.slot === i}
            onSelect={heroId ? () => handlePickSlotClick(i) : undefined}
            isSwapSource={swapSource === i}
            isSwapTarget={swapSource !== null && swapSource !== i && !!heroId} />
        ))}
      </div>

      {/* ban-row-2:2 个 ban 槽横排(方案A:与 ban-row-1 相同的 flex + 固定槽宽 + gap 6px) */}
      <div className="flex h-16 shrink-0 items-center gap-[6px]">
        {banPhase2.map((heroId, i) => (
          <TeamSlot key={`b2-${i}`} heroId={heroId ?? null} type="ban" side={side} index={3 + i} mirrored={isBlue}
            isActive={activeSlot?.type === 'ban' && activeSlot.slot === 3 + i} />
        ))}
      </div>

      {/* pick ×2:竖向堆叠(与上方 pick 区等比,保证每个 pick 槽高度接近) */}
      <div className="flex min-h-0 flex-[0.67] flex-col gap-[5px]">
        {pickPhase2.map((heroId, i) => (
          <TeamSlot key={`p2-${i}`} heroId={heroId ?? null} type="pick" side={side} index={3 + i} mirrored={isBlue}
            isActive={activeSlot?.type === 'pick' && activeSlot.slot === 3 + i}
            onSelect={heroId ? () => handlePickSlotClick(3 + i) : undefined}
            isSwapSource={swapSource === 3 + i}
            isSwapTarget={swapSource !== null && swapSource !== 3 + i && !!heroId} />
        ))}
      </div>
    </div>
  )
}

export default TeamSection
