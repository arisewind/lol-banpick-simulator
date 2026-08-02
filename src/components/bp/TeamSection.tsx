import { useTranslation } from 'react-i18next'
import type { TeamState, TeamSide } from '../../contexts/BPContext'
import { cn } from '../../utils/cn'
import TeamSlot from './TeamSlot'

interface TeamSectionProps {
  side: TeamSide
  team: TeamState
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
  const isBlue = side === 'blue'

  // 穿插切片:按 BP 流程顺序取对应槽位,空位补 null
  const banPhase1 = [team.bans[0], team.bans[1], team.bans[2]]          // 3 个 ban(第一阶段)
  const pickPhase1 = [team.picks[0], team.picks[1], team.picks[2]]      // 3 个 pick(第一阶段)
  const banPhase2 = [team.bans[3], team.bans[4]]                        // 2 个 ban(第二阶段)
  const pickPhase2 = [team.picks[3], team.picks[4]]                     // 2 个 pick(第二阶段)

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 px-4 py-3">
      {/* 队名标签(小型,面板顶部) */}
      <div className={cn(
        'flex shrink-0 items-center gap-2 border-b pb-2',
        isBlue ? 'border-lol-blue/30' : 'border-lol-red/30',
      )}>
        <div className={cn(
          'h-3 w-3 rounded-full',
          isBlue ? 'bg-lol-blue' : 'bg-lol-red',
        )} />
        <h2 className={cn(
          'text-sm font-bold uppercase tracking-widest',
          isBlue ? 'text-lol-blue' : 'text-lol-red',
        )}>
          {t(`bp.${side}Team`)}
        </h2>
      </div>

      {/* ban-row-1:3 个 ban 槽横排(固定高度,对齐 pickban ban-row) */}
      <div className="grid h-[80px] shrink-0 grid-cols-3 gap-[5px]">
        {banPhase1.map((heroId, i) => (
          <TeamSlot key={`b1-${i}`} heroId={heroId ?? null} type="ban" side={side} index={i} mirrored={isBlue} />
        ))}
      </div>

      {/* pick ×3:竖向堆叠,每个 flex-1 瓜分剩余高度 */}
      <div className="flex min-h-0 flex-1 flex-col gap-[5px]">
        {pickPhase1.map((heroId, i) => (
          <TeamSlot key={`p1-${i}`} heroId={heroId ?? null} type="pick" side={side} index={i} mirrored={isBlue} />
        ))}
      </div>

      {/* ban-row-2:2 个 ban 槽横排 */}
      <div className="grid h-[80px] shrink-0 grid-cols-2 gap-[5px]">
        {banPhase2.map((heroId, i) => (
          <TeamSlot key={`b2-${i}`} heroId={heroId ?? null} type="ban" side={side} index={3 + i} mirrored={isBlue} />
        ))}
      </div>

      {/* pick ×2:竖向堆叠 */}
      <div className="flex min-h-0 flex-[0.67] flex-col gap-[5px]">
        {pickPhase2.map((heroId, i) => (
          <TeamSlot key={`p2-${i}`} heroId={heroId ?? null} type="pick" side={side} index={3 + i} mirrored={isBlue} />
        ))}
      </div>
    </div>
  )
}

export default TeamSection
