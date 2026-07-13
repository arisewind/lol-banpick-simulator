import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBP } from '../../contexts/BPContext'
import { useHeroes } from '../../contexts/HeroContext'
import HeroCard from './HeroCard'
import { cn } from '../../utils/cn'

// 获取标签的翻译文本
function getTagLabel(tag: string, t: (key: string) => string): string {
  return t(`hero.tags.${tag.toLowerCase()}`)
}

export default function HeroGrid() {
  const { t } = useTranslation()
  const { filteredHeroes, searchQuery, setSearchQuery, selectedTags, setSelectedTags, availableTags, loading } = useHeroes()
  const { getCurrentPhase, banHero, pickHero, blueTeam, redTeam } = useBP()
  const [showTags, setShowTags] = useState(false)

  // 获取所有已选择的英雄 ID
  const getSelectedHeroIds = () => {
    const selected = new Set<string>()
    blueTeam.bans.forEach(id => selected.add(id))
    redTeam.bans.forEach(id => selected.add(id))
    blueTeam.picks.forEach(id => selected.add(id))
    redTeam.picks.forEach(id => selected.add(id))
    return selected
  }

  const selectedIds = getSelectedHeroIds()
  const phase = getCurrentPhase()

  // 处理英雄点击
  const handleHeroClick = (heroId: string) => {
    if (!phase) return

    // 检查英雄是否已被选择
    if (selectedIds.has(heroId)) return

    // 根据当前阶段执行 ban 或 pick
    if (phase.action === 'ban') {
      banHero(heroId)
    } else {
      pickHero(heroId)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* 搜索框 */}
      <div className="mb-3">
        <input
          type="text"
          placeholder={t('hero.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'input-game w-full rounded px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500',
            'border-slate-700 bg-slate-900/80 backdrop-blur-sm',
            'focus:ring-2 focus:ring-lol-blue/20'
          )}
        />
      </div>

      {/* 标签过滤 */}
      <div className="mb-3">
        <button
          onClick={() => setShowTags(!showTags)}
          className={cn(
            'mb-2 flex w-full items-center justify-between rounded px-3 py-2 text-xs',
            'border border-slate-700 bg-slate-900/60 backdrop-blur-sm text-slate-400',
            'hover:bg-slate-800 hover:border-slate-600',
            'transition-all duration-150'
          )}
        >
          <span>{t('hero.tagFilter')} {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
          <span className={cn(
            'transition-transform duration-150',
            showTags ? 'rotate-90' : ''
          )}>▶</span>
        </button>

        {showTags && (
          <div className={cn(
            'mt-2 flex flex-wrap gap-2 rounded p-3',
            'border border-slate-700/50 bg-slate-900/40 backdrop-blur-sm',
            'animate-slide-in-up'
          )}>
            {availableTags.map((tagEn) => {
              const isSelected = selectedTags.includes(tagEn)
              return (
                <button
                  key={tagEn}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedTags(selectedTags.filter((t) => t !== tagEn))
                    } else {
                      setSelectedTags([...selectedTags, tagEn])
                    }
                  }}
                  className={cn(
                    'rounded px-3 py-1.5 text-xs font-medium transition-all duration-150',
                    'hover:scale-105',
                    isSelected
                      ? cn(
                          'bg-lol-blue text-white shadow-blue',
                          'border border-lol-blue/50'
                        )
                      : cn(
                          'bg-slate-800 text-slate-400 border border-slate-700',
                          'hover:border-slate-600 hover:text-slate-300'
                        )
                  )}
                >
                  {getTagLabel(tagEn, t)}
                </button>
              )
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className={cn(
                  'ml-auto rounded px-3 py-1.5 text-xs font-medium transition-all duration-150',
                  'text-slate-500 hover:text-lol-gold hover:scale-105'
                )}
              >
                {t('common.clear')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 当前操作提示 */}
      {phase && (
        <div className={cn(
          'mb-3 rounded p-3 text-center',
          'border backdrop-blur-sm transition-all duration-200',
          phase.side === 'blue'
            ? 'bg-lol-blue/10 border-lol-blue/30 text-lol-blue'
            : 'bg-lol-red/10 border-lol-red/30 text-lol-red',
          'animate-fade-in'
        )}>
          <span className="text-xs font-medium">
            {t(`bp.${phase.action}Hero`)} -{' '}
            {t(`bp.${phase.side}Team`)}{t('bp.turn')}
          </span>
        </div>
      )}

      {/* 英雄网格 */}
      <div className="grid flex-1 grid-cols-3 gap-4 overflow-y-auto p-2">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center">
            <div className="text-slate-400">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mx-auto" />
              <span className="text-xs">{t('hero.loadingHeroes')}</span>
            </div>
          </div>
        ) : filteredHeroes.length === 0 ? (
          <div className="col-span-3 flex items-center justify-center">
            <span className="text-slate-500">
              {searchQuery ? t('hero.noHeroesFound') : t('hero.noHeroData')}
            </span>
          </div>
        ) : (
          filteredHeroes.map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              isDisabled={selectedIds.has(hero.id)}
              isCurrentPhase={!!phase}
              actionType={phase?.action || null}
              onClick={() => handleHeroClick(hero.id)}
            />
          ))
        )}
      </div>

      {/* 统计信息 */}
      <div className="mt-4 border-t border-slate-800 pt-4">
        <div className="mb-2 text-xs text-slate-500">
          {t('hero.totalHeroes', { count: filteredHeroes.length })}
        </div>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className={cn(
              'h-3 w-3 rounded border-2',
              'border-lol-red/60 bg-lol-red/20'
            )} />
            <span className="text-slate-600">{t('bp.ban')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              'h-3 w-3 rounded border-2',
              'border-lol-blue/60 bg-lol-blue/20'
            )} />
            <span className="text-slate-600">{t('bp.pick')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
