import { useTranslation } from 'react-i18next'
import { useData } from '../../contexts/DataContext'
import { cn } from '../../utils/cn'

export default function AnalysisPanel() {
  const { t } = useTranslation()
  const { recommendations, synergyAnalysis, matchupAnalysis, loading, analyze } = useData()

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
      <div className={cn(
        'mb-4 pb-3 border-b border-slate-800',
        'animate-fade-in'
      )}>
        <h3 className="text-sm font-bold text-slate-100">{t('analysis.title')}</h3>
        <p className="text-xs text-slate-500">{t('analysis.subtitle')}</p>
      </div>

      {/* 分析按钮 */}
      <button
        onClick={analyze}
        disabled={loading}
        className={cn(
          'btn-game mb-4 rounded px-4 py-2.5 text-sm font-medium',
          'bg-lol-blue text-white hover:bg-lol-blue-glow',
          'shadow-blue hover:shadow-blue-lg',
          'disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-150',
          loading && 'animate-pulse'
        )}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {t('common.analyzing')}
          </span>
        ) : (
          t('analysis.startAnalysis')
        )}
      </button>

      {/* 推荐列表 */}
      <div className="mb-6">
        <h4 className="mb-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
          {t('analysis.recommendations')}
        </h4>
        <div className="space-y-2">
          {recommendations.length === 0 ? (
            <div className={cn(
              'rounded p-4 text-center border border-dashed border-slate-700',
              'bg-slate-900/30'
            )}>
              <div className="flex flex-col items-center gap-2">
                <svg className="h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-xs text-slate-600">{t('analysis.noRecommendations')}</span>
              </div>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div
                key={rec.heroId}
                className={cn(
                  'rounded p-3 border transition-all duration-150',
                  'hover-scale cursor-pointer',
                  'bg-slate-900/60 border-slate-700/50 hover:border-slate-600',
                  'animate-slide-in-up'
                )}
                style={{ animationDelay: index > 0 ? '100ms' : undefined }}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">
                    {rec.heroId}
                  </span>
                  <span
                    className={cn(
                      'rounded px-2 py-0.5 text-xs font-medium',
                      rec.priority === 'high'
                        ? 'bg-lol-red/20 text-lol-red border border-lol-red/30'
                        : rec.priority === 'medium'
                        ? 'bg-lol-gold/20 text-lol-gold border border-lol-gold/30'
                        : 'bg-lol-blue/20 text-lol-blue border border-lol-blue/30'
                    )}
                  >
                    {getPriorityLabel(rec.priority)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{rec.reason}</p>
                {rec.winRate && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-slate-800">
                      <div
                        className={cn(
                          'h-1 rounded-full',
                          rec.winRate > 50 ? 'bg-lol-blue' : 'bg-lol-red'
                        )}
                        style={{ width: `${rec.winRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{rec.winRate.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="mt-auto">
        <h4 className="mb-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
          {t('analysis.quickStats')}
        </h4>
        <div className={cn(
          'rounded p-4 border border-slate-700/50',
          'bg-slate-900/40 backdrop-blur-sm'
        )}>
          <div className="mb-3 flex justify-between text-xs">
            <span className="text-slate-500">{t('stats.synergy')}</span>
            <span className="text-lol-gold font-mono">
              {synergyAnalysis ? synergyAnalysis.score : t('common.calculating')}
            </span>
          </div>
          <div className="mb-3 flex justify-between text-xs">
            <span className="text-slate-500">{t('stats.matchupAdvantage')}</span>
            <span className="text-lol-blue font-mono">
              {matchupAnalysis
                ? `${matchupAnalysis.blueAdvantage}% : ${matchupAnalysis.redAdvantage}%`
                : t('common.analyzing')}
            </span>
          </div>
          {matchupAnalysis && matchupAnalysis.keyFactors.length > 0 && (
            <div className="mt-2 space-y-1 border-t border-slate-800 pt-2">
              {matchupAnalysis.keyFactors.slice(0, 3).map((factor, i) => (
                <div key={i} className="text-xs text-slate-500">• {factor}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
