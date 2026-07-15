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
  const { filteredHeroes, searchQuery, setSearchQuery, selectedTags, setSelectedTags, availableTags, loading, error, refreshHeroes } = useHeroes()
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
    if (selectedIds.has(heroId)) return
    if (phase.action === 'ban') {
      banHero(heroId)
    } else {
      pickHero(heroId)
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* 顶行：搜索 + 标签筛选 + 统计（单行横向） */}
      <div className="mb-2 flex items-center gap-3">
        <input
          type="text"
          placeholder={t('hero.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'input-game w-64 rounded px-4 py-2 text-sm text-slate-100 placeholder-slate-500',
            'border-slate-700 bg-slate-900/80 backdrop-blur-sm',
            'focus:ring-2 focus:ring-lol-blue/20',
          )}
        />
        <div className="relative">
          <button
            onClick={() => setShowTags(!showTags)}
            className={cn(
              'flex items-center gap-1 rounded px-3 py-2 text-xs',
              'border border-slate-700 bg-slate-900/60 text-slate-400 backdrop-blur-sm',
              'transition-all duration-150 hover:border-slate-600 hover:bg-slate-800',
            )}
          >
            <span>{t('hero.tagFilter')} {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
            <span className={cn('transition-transform duration-150', showTags ? 'rotate-90' : '')}>▶</span>
          </button>
          {showTags && (
            <div className={cn(
              'absolute left-0 top-full z-20 mt-1 w-72 rounded p-3',
              'border border-slate-700/50 bg-slate-900/95 shadow-lg backdrop-blur-sm',
              'animate-slide-in-up',
            )}>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tagEn) => {
                  const isSelected = selectedTags.includes(tagEn)
                  return (
                    <button
                      key={tagEn}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTags(selectedTags.filter((tg) => tg !== tagEn))
                        } else {
                          setSelectedTags([...selectedTags, tagEn])
                        }
                      }}
                      className={cn(
                        'rounded px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105',
                        isSelected
                          ? 'border border-lol-blue/50 bg-lol-blue text-white shadow-blue'
                          : 'border border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300',
                      )}
                    >
                      {getTagLabel(tagEn, t)}
                    </button>
                  )
                })}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className={cn(
                    'mt-2 rounded px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105',
                    'text-slate-500 hover:text-lol-gold',
                  )}
                >
                  {t('common.clear')}
                </button>
              )}
            </div>
          )}
        </div>
        <span className="ml-auto text-xs text-slate-500">
          {t('hero.totalHeroes', { count: filteredHeroes.length })}
        </span>
      </div>

      {/* 当前操作提示 */}
      {phase && (
        <div className={cn(
          'mb-2 rounded p-2 text-center border backdrop-blur-sm transition-all duration-200',
          'animate-fade-in',
          phase.side === 'blue'
            ? 'bg-lol-blue/10 border-lol-blue/30 text-lol-blue'
            : 'bg-lol-red/10 border-lol-red/30 text-lol-red',
        )}>
          <span className="text-xs font-medium">
            {t(`bp.${phase.action}Hero`)} - {t(`bp.${phase.side}Team`)}{t('bp.turn')}
          </span>
        </div>
      )}

      {/* 英雄网格（横向密集，限高滚动） */}
      <div className="grid flex-1 grid-cols-8 gap-2 overflow-y-auto sm:grid-cols-10 lg:grid-cols-12">
        {loading ? (
          <div className="col-span-12 flex items-center justify-center">
            <div className="text-slate-400">
              <div className="mb-2 mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
              <span className="text-xs">{t('hero.loadingHeroes')}</span>
            </div>
          </div>
        ) : error ? (
          <div className="col-span-12 flex flex-col items-center justify-center gap-3">
            <span className="text-sm text-lol-red">{error}</span>
            <button
              onClick={() => refreshHeroes()}
              className="rounded bg-lol-blue px-4 py-1.5 text-xs font-medium text-lol-darker transition-colors hover:bg-lol-blue-glow"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : filteredHeroes.length === 0 ? (
          <div className="col-span-12 flex items-center justify-center">
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
    </div>
  )
}
