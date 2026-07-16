import { useState, useMemo, useCallback } from 'react'
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

  // 获取所有已选择的英雄 ID（useMemo 稳定引用，避免每次渲染新建 Set 导致 HeroCard memo 失效）
  const selectedIds = useMemo(() => {
    const selected = new Set<string>()
    blueTeam.bans.forEach(id => selected.add(id))
    redTeam.bans.forEach(id => selected.add(id))
    blueTeam.picks.forEach(id => selected.add(id))
    redTeam.picks.forEach(id => selected.add(id))
    return selected
  }, [blueTeam, redTeam])
  const phase = getCurrentPhase()

  // 处理英雄点击（useCallback 稳定引用，作为 onSelect 传给 memo 化的 HeroCard）
  const handleHeroClick = useCallback((heroId: string) => {
    if (!phase) return
    if (selectedIds.has(heroId)) return
    if (phase.action === 'ban') {
      banHero(heroId)
    } else {
      pickHero(heroId)
    }
  }, [phase, selectedIds, banHero, pickHero])

  return (
    <div className="relative flex h-full flex-col">
      {/* 顶行：搜索 + 标签筛选 + 统计（单行横向） */}
      <div className="mb-3 flex items-center gap-3">
        <input
          type="text"
          placeholder={t('hero.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'input-game w-64 rounded-lg px-4 py-2.5 text-sm text-lol-text-primary placeholder-lol-text-muted',
            'border-lol-border bg-lol-bg-dark/90 backdrop-blur-sm',
            'focus:border-lol-blue focus:shadow-blue',
          )}
        />
        <div className="relative">
          <button
            onClick={() => setShowTags(!showTags)}
            className={cn(
              'flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium',
              'border border-lol-border bg-lol-bg-dark/70 text-lol-text-secondary backdrop-blur-sm',
              'transition-all duration-150 hover:border-lol-border/80 hover:bg-lol-bg-dark',
            )}
          >
            <span>{t('hero.tagFilter')} {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
            <span className={cn('transition-transform duration-150', showTags ? 'rotate-90' : '')}>▶</span>
          </button>
          {showTags && (
            <div className={cn(
              'absolute left-0 top-full z-20 mt-1 w-72 rounded-lg p-3',
              'border border-lol-border bg-lol-bg-dark/95 shadow-xl backdrop-blur-sm',
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
                        'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 hover:scale-105',
                        isSelected
                          ? 'border-2 border-lol-blue bg-lol-blue text-white shadow-blue'
                          : 'border border-lol-border bg-lol-bg-black text-lol-text-secondary hover:border-lol-border/80 hover:text-lol-text-primary',
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
                    'text-lol-text-muted hover:text-lol-gold',
                  )}
                >
                  {t('common.clear')}
                </button>
              )}
            </div>
          )}
        </div>
        <span className="ml-auto text-xs text-lol-text-muted">
          {t('hero.totalHeroes', { count: filteredHeroes.length })}
        </span>
      </div>

      {/* 当前操作提示 - 电竞风格 */}
      {phase && (
        <div className={cn(
          'mb-3 rounded-lg p-2.5 text-center border-2 backdrop-blur-sm transition-all duration-200',
          'animate-fade-in',
          phase.side === 'blue'
            ? 'bg-lol-blue/20 border-lol-blue/50 text-lol-blue shadow-blue-sm'
            : 'bg-lol-red/20 border-lol-red/50 text-lol-red shadow-red-sm',
        )}>
          <span className="text-sm font-bold">
            {t(`bp.${phase.action}Hero`)} - {t(`bp.${phase.side}Team`)}{t('bp.turn')}
          </span>
        </div>
      )}

      {/* 英雄网格（横向密集，限高滚动） - 电竞风格增强间距 */}
      <div className="grid flex-1 grid-cols-8 gap-4 overflow-y-auto sm:grid-cols-10 lg:grid-cols-12">
        {loading ? (
          <div className="col-span-12 flex items-center justify-center">
            <div className="text-lol-text-secondary">
              <div className="mb-2 mx-auto h-8 w-8 animate-spin rounded-full border-2 border-lol-border border-t-transparent" />
              <span className="text-xs">{t('hero.loadingHeroes')}</span>
            </div>
          </div>
        ) : error ? (
          <div className="col-span-12 flex flex-col items-center justify-center gap-3">
            <span className="text-sm text-lol-red">{error}</span>
            <button
              onClick={() => refreshHeroes()}
              className="rounded-lg bg-lol-blue px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-lol-blue-light hover:shadow-blue"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : filteredHeroes.length === 0 ? (
          <div className="col-span-12 flex items-center justify-center">
            <span className="text-lol-text-muted">
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
              onSelect={handleHeroClick}
            />
          ))
        )}
      </div>
    </div>
  )
}
