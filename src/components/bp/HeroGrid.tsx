import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBP } from '../../contexts/BPContext'
import { useHeroes } from '../../contexts/HeroContext'
import HeroCard from './HeroCard'

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
          className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* 标签过滤 */}
      <div className="mb-3">
        <button
          onClick={() => setShowTags(!showTags)}
          className="mb-2 flex w-full items-center justify-between rounded border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800"
        >
          <span>{t('hero.tagFilter')} {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
          <span className="text-slate-500">{showTags ? '▼' : '▶'}</span>
        </button>

        {showTags && (
          <div className="mt-2 flex flex-wrap gap-1.5 rounded border border-slate-700/50 bg-slate-800/30 p-2">
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
                  className={`rounded px-2 py-1 text-xs transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {getTagLabel(tagEn, t)}
                </button>
              )
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="ml-auto rounded px-2 py-1 text-xs text-slate-500 hover:text-slate-300"
              >
                {t('common.clear')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 当前操作提示 */}
      {phase && (
        <div className="mb-3 rounded bg-slate-800/50 p-2 text-center">
          <span className="text-xs text-slate-400">
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
            <div className="h-3 w-3 rounded border border-red-900/30 bg-red-950/30" />
            <span className="text-slate-600">{t('bp.ban')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border border-blue-900/30 bg-blue-950/30" />
            <span className="text-slate-600">{t('bp.pick')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
