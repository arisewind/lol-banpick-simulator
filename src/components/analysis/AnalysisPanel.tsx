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
      {/* 标题 - pickban.pro 风格 */}
      <div className={cn(
        'mb-5 pb-4 border-b border-lol-border',
        'animate-fade-in'
      )}>
        <h3 className="text-base font-bold text-lol-text-primary">{t('analysis.title')}</h3>
        <p className="text-xs text-lol-text-secondary">{t('analysis.subtitle')}</p>
      </div>

      {/* 分析按钮 - pickban.pro 风格:金底 + 硬阴影 + uppercase */}
      <button
        onClick={analyze}
        disabled={loading}
        className={cn(
          'btn-game mb-5 rounded px-5 py-3 text-sm font-bold uppercase tracking-wider',
          'bg-lol-blue text-black',
          'shadow-hard hover:shadow-hard-hover active:shadow-hard-active',
          'disabled:bg-lol-bg-secondary disabled:text-lol-text-muted disabled:cursor-not-allowed disabled:shadow-none',
          'transition-all duration-200',
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
              'rounded p-4 text-center border border-dashed border-lol-border',
              'bg-lol-bg-black/40'
            )}>
              <div className="flex flex-col items-center gap-2">
                <svg className="h-8 w-8 text-lol-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-xs text-lol-text-muted">{t('analysis.noRecommendations')}</span>
              </div>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div
                key={rec.heroId}
                className={cn(
                  'rounded p-3.5 border-2 border-lol-border transition-all duration-150',
                  'hover-scale cursor-pointer hover:border-lol-gold',
                  'bg-lol-bg-black/60',
                  'animate-slide-in-up'
                )}
                style={{ animationDelay: index > 0 ? '100ms' : undefined }}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-lol-text-primary">
                    {rec.heroId}
                  </span>
                  <span
                    className={cn(
                      'rounded px-2.5 py-1 text-xs font-bold border-2',
                      rec.priority === 'high'
                        ? 'bg-lol-red/20 text-lol-red border-lol-red/50'
                        : rec.priority === 'medium'
                        ? 'bg-lol-gold/20 text-lol-gold border-lol-gold/50'
                        : 'bg-lol-blue/20 text-lol-blue border-lol-blue/50'
                    )}
                  >
                    {getPriorityLabel(rec.priority)}
                  </span>
                </div>
                <p className="text-xs text-lol-text-secondary line-clamp-2">{rec.reason}</p>
                {rec.winRate && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-lol-bg-secondary">
                      <div
                        className={cn(
                          'h-1 rounded-full',
                          rec.winRate > 50 ? 'bg-lol-blue' : 'bg-lol-red'
                        )}
                        style={{ width: `${rec.winRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-lol-text-secondary">{rec.winRate.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 统计信息 - pickban.pro 风格 */}
      <div className="mt-auto">
        <h4 className="mb-3 text-xs font-bold text-lol-text-secondary uppercase tracking-wider">
          {t('analysis.quickStats')}
        </h4>
        <div className={cn(
          'rounded p-4 border border-lol-border',
          'bg-lol-bg-black/80 shadow-hard-sm'
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
            <div className="mt-2 space-y-1.5 border-t border-lol-border pt-3">
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
