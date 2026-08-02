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

/**
 * 英雄选择区 - pickban.pro 中列范式
 * 三行 grid:搜索+role过滤(顶) / 英雄网格(中,可滚) / 当前操作提示(底)
 * 功能逻辑(搜索/标签筛选/点击 ban/pick)全部保留,只重构布局容器。
 */
export default function HeroGrid() {
  const { t } = useTranslation()
  const { filteredHeroes, searchQuery, setSearchQuery, selectedTags, setSelectedTags, availableTags, loading, error, refreshHeroes } = useHeroes()
  const { getCurrentPhase, banHero, pickHero, blueTeam, redTeam } = useBP()
  const [showTags, setShowTags] = useState(false)

  // 获取所有已选择的英雄 ID(useMemo 稳定引用,避免每次渲染新建 Set 导致 HeroCard memo 失效)
  const selectedIds = useMemo(() => {
    const selected = new Set<string>()
    blueTeam.bans.forEach(id => selected.add(id))
    redTeam.bans.forEach(id => selected.add(id))
    blueTeam.picks.forEach(id => selected.add(id))
    redTeam.picks.forEach(id => selected.add(id))
    return selected
  }, [blueTeam, redTeam])
  const phase = getCurrentPhase()

  // 处理英雄点击(useCallback 稳定引用,作为 onSelect 传给 memo 化的 HeroCard)
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
    <div className="grid h-full grid-rows-[auto_1fr_auto] gap-2 px-3 py-3 min-h-0">
      {/* 第 1 行:搜索框 + 标签筛选 + 统计(横向单行) */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={t('hero.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'input-game w-44 rounded px-3 py-2 text-sm text-lol-text-primary placeholder-lol-text-muted',
          )}
        />
        <div className="relative">
          <button
            onClick={() => setShowTags(!showTags)}
            className={cn(
              'flex items-center gap-1 rounded px-3 py-2 text-xs font-medium',
              'border border-lol-border bg-lol-bg-secondary text-lol-text-secondary',
              'transition-all duration-150 hover:bg-lol-bg-card',
            )}
          >
            <span>{t('hero.tagFilter')} {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
            <span className={cn('transition-transform duration-150', showTags ? 'rotate-90' : '')}>▶</span>
          </button>
          {showTags && (
            <div className={cn(
              'absolute left-0 top-full z-30 mt-1 w-64 rounded p-3',
              'border border-lol-border bg-lol-bg-dark shadow-hard',
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
                        'rounded px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                        isSelected
                          ? 'border-2 border-lol-blue bg-lol-blue text-black'
                          : 'border border-lol-border bg-lol-bg-black text-lol-text-secondary hover:text-lol-text-primary',
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
                    'mt-2 rounded px-3 py-1.5 text-xs font-medium transition-all duration-150',
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

      {/* 第 2 行:英雄网格(pickban.pro 规范:110px 卡片 + 10px gap,限高滚动)
          中列约 600px 宽,5 列 × 110px + 4 × 10px = 590px 正好放下;
          min-h-0 让 grid 行可收缩;卡片固定宽自动居中 */}
      <div className="grid min-h-0 flex-1 grid-cols-[repeat(5,1fr)] gap-x-[10px] gap-y-1 overflow-y-auto overflow-x-hidden px-3">
        {loading ? (
          <div className="col-span-5 flex items-center justify-center">
            <div className="text-lol-text-secondary">
              <div className="mb-2 mx-auto h-8 w-8 animate-spin rounded-full border-2 border-lol-border border-t-transparent" />
              <span className="text-xs">{t('hero.loadingHeroes')}</span>
            </div>
          </div>
        ) : error ? (
          <div className="col-span-5 flex flex-col items-center justify-center gap-3">
            <span className="text-sm text-lol-red">{error}</span>
            <button
              onClick={() => refreshHeroes()}
              className="rounded bg-lol-blue px-4 py-1.5 text-xs font-bold text-black shadow-hard transition-all hover:bg-lol-blue-light"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : filteredHeroes.length === 0 ? (
          <div className="col-span-5 flex items-center justify-center">
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

      {/* 第 3 行:当前操作提示(pickban.pro 风格:队伍色描边 + 硬阴影,无发光) */}
      {phase && (
        <div className={cn(
          'rounded p-2 text-center border-2 transition-all duration-200',
          'animate-fade-in',
          phase.side === 'blue'
            ? 'bg-lol-blue/20 border-lol-blue/50 text-lol-blue shadow-blue-sm'
            : 'bg-lol-red/20 border-lol-red/50 text-lol-red shadow-red-sm',
        )}>
          <span className="text-sm font-bold uppercase tracking-wide">
            {t(`bp.${phase.action}Hero`)} - {t(`bp.${phase.side}Team`)}{t('bp.turn')}
          </span>
        </div>
      )}
    </div>
  )
}
