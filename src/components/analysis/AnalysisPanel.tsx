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
      {/* 标题 - 电竞风格 */}
      <div className={cn(
        'mb-5 pb-4 border-b border-slate-700',
        'animate-fade-in'
      )}>
        <h3 className="text-base font-bold text-lol-text-primary">{t('analysis.title')}</h3>
        <p className="text-xs text-lol-text-secondary">{t('analysis.subtitle')}</p>
      </div>

      {/* 分析按钮 - 电竞风格 */}
      <button
        onClick={analyze}
        disabled={loading}
        className={cn(
          'btn-game mb-5 rounded-lg px-5 py-3 text-sm font-bold',
          'bg-lol-blue text-white',
          'shadow-lg shadow-blue hover:shadow-blue-xl',
          'disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200 hover:scale-105 active:scale-100',
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

      {/* 推荐列表 - 电竞风格 */}
      <div className="mb-6">
        <h4 className="mb-3 text-xs font-bold text-lol-text-secondary uppercase tracking-wider">
          {t('analysis.recommendations')}
        </h4>
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <div className={cn(
              'rounded-lg p-4 text-center border border-dashed border-slate-600',
              'bg-lol-bg-black/40'
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
                  'rounded-lg p-3.5 border-2 border-slate-600 transition-all duration-150',
                  'hover-scale cursor-pointer hover:border-lol-gold hover:shadow-gold',
                  'bg-lol-bg-black/60',
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
                      'rounded-md px-2.5 py-1 text-xs font-bold border-2',
                      rec.priority === 'high'
                        ? 'bg-lol-red/20 text-lol-red border-lol-red/50 shadow-red-sm'
                        : rec.priority === 'medium'
                        ? 'bg-lol-gold/20 text-lol-gold border-lol-gold/50 shadow-gold-sm'
                        : 'bg-lol-blue/20 text-lol-blue border-lol-blue/50 shadow-blue-sm'
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

      {/* 统计信息 - 电竞风格 */}
      <div className="mt-auto">
        <h4 className="mb-3 text-xs font-bold text-lol-text-secondary uppercase tracking-wider">
          {t('analysis.quickStats')}
        </h4>
        <div className={cn(
          'rounded-xl p-4 border border-slate-600',
          'bg-lol-bg-dark/80 backdrop-blur-sm shadow-lg'
        )}>
          <div className="mb-3 flex justify-between text-xs">
            <span className="text-lol-text-muted">{t('stats.synergy')}</span>
            <span className="text-lol-gold font-mono font-bold">
              {synergyAnalysis ? synergyAnalysis.score : t('common.calculating')}
            </span>
          </div>
          <div className="mb-3 flex justify-between text-xs">
            <span className="text-lol-text-muted">{t('stats.matchupAdvantage')}</span>
            <span className="text-lol-blue font-mono font-bold">
              {matchupAnalysis
                ? `${matchupAnalysis.blueAdvantage}% : ${matchupAnalysis.redAdvantage}%`
                : t('common.analyzing')}
            </span>
          </div>
          {matchupAnalysis && matchupAnalysis.keyFactors.length > 0 && (
            <div className="mt-2 space-y-1.5 border-t border-slate-700 pt-3">
              {matchupAnalysis.keyFactors.slice(0, 3).map((factor, i) => (
                <div key={i} className="text-xs text-lol-text-secondary">• {factor}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
