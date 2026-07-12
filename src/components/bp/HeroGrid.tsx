import { useState } from 'react'
import { useBP } from '../../contexts/BPContext'
import { useHeroes } from '../../contexts/HeroContext'
import HeroCard from './HeroCard'

export default function HeroGrid() {
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
          placeholder="搜索英雄..."
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
          <span>标签筛选 {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
          <span className="text-slate-500">{showTags ? '▼' : '▶'}</span>
        </button>

        {showTags && (
          <div className="mt-2 flex flex-wrap gap-1.5 rounded border border-slate-700/50 bg-slate-800/30 p-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedTags(selectedTags.filter((t) => t !== tag))
                    } else {
                      setSelectedTags([...selectedTags, tag])
                    }
                  }}
                  className={`rounded px-2 py-1 text-xs transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="ml-auto rounded px-2 py-1 text-xs text-slate-500 hover:text-slate-300"
              >
                清除
              </button>
            )}
          </div>
        )}
      </div>

      {/* 当前操作提示 */}
      {phase && (
        <div className="mb-3 rounded bg-slate-800/50 p-2 text-center">
          <span className="text-xs text-slate-400">
            {phase.action === 'ban' ? '禁用英雄' : '选择英雄'} -{' '}
            {phase.side === 'blue' ? '蓝方' : '红方'}回合
          </span>
        </div>
      )}

      {/* 英雄网格 */}
      <div className="grid flex-1 grid-cols-4 gap-2 overflow-y-auto">
        {loading ? (
          <div className="col-span-4 flex items-center justify-center">
            <div className="text-slate-400">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-transparent mx-auto" />
              <span className="text-xs">加载英雄数据...</span>
            </div>
          </div>
        ) : filteredHeroes.length === 0 ? (
          <div className="col-span-4 flex items-center justify-center">
            <span className="text-slate-500">
              {searchQuery ? '未找到匹配的英雄' : '暂无英雄数据'}
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
          共 {filteredHeroes.length} 位英雄
        </div>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border border-red-900/30 bg-red-950/30" />
            <span className="text-slate-600">禁用</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded border border-blue-900/30 bg-blue-950/30" />
            <span className="text-slate-600">选择</span>
          </div>
        </div>
      </div>
    </div>
  )
}
