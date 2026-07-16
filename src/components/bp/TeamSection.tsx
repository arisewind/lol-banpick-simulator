import { useTranslation } from 'react-i18next'
import { SLOTS_PER_TEAM } from '../../contexts/BPContext'
import type { TeamState, TeamSide } from '../../contexts/BPContext'
import { cn } from '../../utils/cn'
import TeamSlot from './TeamSlot'

interface TeamSectionProps {
  side: TeamSide
  team: TeamState
}

/**
 * 单支队伍的完整区域（队名 + Ban 区 + Pick 区）
 * 蓝红两方复用，颜色用字面量三元切换（遵循 Tailwind JIT 字面量约束）
 */
function TeamSection({ side, team }: TeamSectionProps) {
  const { t } = useTranslation()
  const isBlue = side === 'blue'

  return (
    <div className="flex flex-col px-8 py-10">
      {/* 队名区 - 电竞风格 */}
      <div className={cn(
        'mb-12 flex items-center gap-4 border-b pb-6',
        isBlue ? 'border-lol-blue/30' : 'border-lol-red/30',
      )}>
        <div className={cn(
          'relative h-5 w-5 rounded-full shadow-xl animate-pulse',
          isBlue ? 'bg-lol-blue shadow-blue-lg' : 'bg-lol-red shadow-red-lg',
        )} />
        <h2 className={cn(
          'text-4xl font-extrabold tracking-wider',
          isBlue ? 'text-lol-blue' : 'text-lol-red',
        )}>
          {t(`bp.${side}Team`)}
        </h2>
      </div>

      {/* Ban 区 */}
      <div className="mb-12">
        <div className="mb-5 flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-lol-text-secondary">{t('bp.ban')}</span>
          <div className="flex-1 h-px bg-lol-border" />
        </div>
        <div className="grid grid-cols-5 gap-6">
          {team.bans.map((ban, i) => (
            <TeamSlot key={ban} heroId={ban} type="ban" side={side} index={i} />
          ))}
          {Array.from({ length: SLOTS_PER_TEAM - team.bans.length }).map((_, i) => (
            <TeamSlot key={`empty-${side}-ban-${i}`} heroId={null} type="ban" side={side} index={team.bans.length + i} />
          ))}
        </div>
      </div>

      {/* Pick 区 */}
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className={cn(
            'text-base font-bold uppercase tracking-widest',
            isBlue ? 'text-lol-blue' : 'text-lol-red',
          )}>{t('bp.pick')}</span>
          <div className={cn('flex-1 h-px', isBlue ? 'bg-lol-blue/40' : 'bg-lol-red/40')} />
        </div>
        <div className="grid grid-cols-5 gap-6">
          {team.picks.map((pick, i) => (
            <TeamSlot key={pick} heroId={pick} type="pick" side={side} index={i} />
          ))}
          {Array.from({ length: SLOTS_PER_TEAM - team.picks.length }).map((_, i) => (
            <TeamSlot key={`empty-${side}-pick-${i}`} heroId={null} type="pick" side={side} index={team.picks.length + i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeamSection
