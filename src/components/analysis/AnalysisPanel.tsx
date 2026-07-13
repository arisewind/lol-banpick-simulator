import { useTranslation } from 'react-i18next'
import { useData } from '../../contexts/DataContext'

export default function AnalysisPanel() {
  const { t } = useTranslation()
  const { recommendations, loading, analyze } = useData()

  // 优先级标签映射
  const getPriorityLabel = (priority: string): string => {
    if (priority === 'high') return t('stats.high')
    if (priority === 'medium') return t('stats.medium')
    if (priority === 'low') return t('stats.low')
    return priority
  }

  return (
    <div className="flex h-full flex-col">
      {/* 标题 */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-100">{t('analysis.title')}</h3>
        <p className="text-xs text-slate-500">{t('analysis.subtitle')}</p>
      </div>

      {/* 分析按钮 */}
      <button
        onClick={analyze}
        disabled={loading}
        className="mb-4 rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700 disabled:bg-slate-700"
      >
        {loading ? t('common.analyzing') : t('analysis.startAnalysis')}
      </button>

      {/* 推荐列表 */}
      <div className="mb-6">
        <h4 className="mb-2 text-xs font-medium text-slate-400">
          {t('analysis.recommendations')}
        </h4>
        <div className="space-y-2">
          {recommendations.length === 0 ? (
            <div className="rounded bg-slate-900/30 p-3 text-center text-xs text-slate-500">
              {t('analysis.noRecommendations')}
            </div>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.heroId}
                className="rounded bg-slate-900/30 p-3 transition hover:bg-slate-900/50"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">
                    {rec.heroId}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      rec.priority === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {getPriorityLabel(rec.priority)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{rec.reason}</p>
                {rec.winRate && (
                  <div className="mt-1 text-xs text-slate-600">
                    {t('stats.winRate')}: {rec.winRate.toFixed(1)}%
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="mt-auto">
        <h4 className="mb-2 text-xs font-medium text-slate-400">
          {t('analysis.quickStats')}
        </h4>
        <div className="rounded bg-slate-900/30 p-3">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-slate-500">{t('stats.synergy')}</span>
            <span className="text-slate-400">{t('common.calculating')}</span>
          </div>
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-slate-500">{t('stats.matchupAdvantage')}</span>
            <span className="text-slate-400">{t('common.analyzing')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">{t('stats.accuracy')}</span>
            <span className="text-slate-400">{t('common.pending')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
