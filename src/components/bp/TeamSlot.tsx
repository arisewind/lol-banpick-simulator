import { useHeroes } from '../../contexts/HeroContext'
import { cn } from '../../utils/cn'
import { useHeroImage } from '../../hooks/useHeroImage'
import { useHeroSplash } from '../../hooks/useHeroSplash'

export interface TeamSlotProps {
  heroId: string | null
  type: 'ban' | 'pick'
  side: 'blue' | 'red'
  index: number
  /**
   * 是否镜像(蓝方 pick 槽用)。pickban.pro 标志性技巧:
   * 整个 pick 槽 scaleX(-1) 水平翻转(英雄原画朝中心对峙),
   * 内部文字再 scaleX(-1) 反向修正,保证文字正向可读。
   */
  mirrored?: boolean
}

/**
 * 单个 ban/pick 槽位 - pickban.pro 风格
 * - ban 位:小正方形 + 方形头像 + 复合滤镜染暗红色调
 * - pick 位:队伍色硬边框(金/品红)+ 偏移硬阴影 + 英雄原画(loading 竖版)铺满 + 底部英雄名
 * - 蓝方 pick 槽可镜像(mirrored),实现英雄原画朝中心对峙的仪式感
 */
function TeamSlot({ heroId, type, side, index, mirrored = false }: TeamSlotProps) {
  const { getHeroById } = useHeroes()
  const hero = heroId ? getHeroById(heroId) : null
  // ban 用方形头像,pick 用横版原画(splash,适配横向 banner 形态的 pick 槽)
  const { imageUrl } = useHeroImage(hero?.id)
  const { splashUrl } = useHeroSplash(hero?.id, 'splash')

  const isBan = type === 'ban'
  const isBlue = side === 'blue'

  // 空槽位:仅显示序号。ban 空槽用 LOL 客户端原生深蓝黑 #010a13
  // 序号标签:[B1]/[R1] 等(原型 C 风格独有元素)
  const seqTag = `${isBlue ? 'B' : 'R'}${index + 1}`

  if (!hero) {
    return (
      <div className={cn(
        'relative overflow-hidden flex items-center justify-center',
        // ban 空槽:受 ban-row 高度约束(h-full),正方形居中;pick 空槽撑满父格
        // C 风格:矩形圆角(ban rounded, pick rounded-lg)
        isBan ? 'aspect-square h-full justify-self-center bg-lol-black border border-lol-border rounded'
              : 'h-full w-full bg-lol-bg-black border border-lol-border rounded-lg',
        // pick 空槽:蓝方镜像
        !isBan && mirrored && 'scale-x-[-1]',
      )}>
        {/* 序号标签(左上角) */}
        <span className={cn(
          'absolute left-1 top-0.5 z-20 font-body text-[9px] font-semibold tracking-wider text-lol-text-muted/70',
          mirrored && !isBan && 'scale-x-[-1]',
        )}>{seqTag}</span>
        <span className={cn(
          'font-mono text-lol-text-muted/60',
          // 镜像时文字反向修正
          mirrored && !isBan && 'scale-x-[-1]',
          isBan ? 'text-lg' : 'text-2xl'
        )}>{index + 1}</span>
      </div>
    )
  }

  // pick 槽优先用原画,原画加载失败回退到方形头像
  const pickImgSrc = splashUrl || imageUrl

  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'border-2',
        // C 风格:矩形圆角(ban rounded, pick rounded-lg)
        isBan ? 'aspect-square h-full justify-self-center bg-lol-black border-lol-border rounded'
              : 'h-full w-full bg-lol-bg-black rounded-lg',
        // Pick 位:队伍色边框 + 品牌色柔光(C 风格:轻微发光,非硬阴影)
        !isBan && (isBlue ? 'border-lol-blue-light shadow-blue-lg' : 'border-lol-red-light shadow-red-lg'),
        // 蓝方 pick 槽:整体水平镜像(英雄原画朝中心对峙)
        !isBan && mirrored && 'scale-x-[-1]',
      )}
      title={hero.name}
    >
      {/* 序号标签(左上角,C 风格独有) */}
      <span className={cn(
        'absolute left-1.5 top-1 z-30 font-body text-[9px] font-semibold tracking-wider text-lol-text-muted/80',
        mirrored && 'scale-x-[-1]',
      )}>{seqTag}</span>
      {/* 英雄图片
          - ban:方形头像 + pickban.pro 复合滤镜(染暗红色调)
          - pick:竖版原画(loading)铺满,object-cover 裁切,略微增强对比饱和 */}
      {isBan ? (
        imageUrl ? (
          <img
            src={imageUrl}
            alt={hero.name}
            className="relative z-10 h-full w-full object-cover"
            style={{
              filter: 'grayscale(100%) brightness(30%) sepia(100%) hue-rotate(-50deg) saturate(600%) contrast(.7)',
            }}
          />
        ) : (
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <span className="text-lol-text-muted text-sm">{hero.name.slice(0, 2)}</span>
          </div>
        )
      ) : (
        pickImgSrc ? (
          <img
            src={pickImgSrc}
            alt={hero.name}
            // splash 横版原画:object-cover + object-top 显示上半部(英雄头部通常在上半)
            className="relative z-10 h-full w-full object-cover object-top"
            style={{ filter: 'contrast(1.1) saturate(1.2)' }}
          />
        ) : (
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <span className={cn(
              'text-lol-text-muted text-xl',
              mirrored && 'scale-x-[-1]',
            )}>{hero.name.slice(0, 2)}</span>
          </div>
        )
      )}

      {/* Ban 位斜线标记 */}
      {isBan && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-white/80 rotate-45" />
        </div>
      )}

      {/* 底部渐变遮罩 + 英雄名(pick 位);文字阴影对齐 pickban.pro 的 text-shadow:2px 2px 1px #000
          镜像时文字容器反向修正,保证英雄名正向可读 */}
      {!isBan && (
        <div className={cn(
          'absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent p-2',
          mirrored && 'scale-x-[-1]',
        )}>
          <p
            className={cn(
              'text-center text-sm font-bold tracking-wide',
              isBlue ? 'text-lol-blue' : 'text-lol-red',
            )}
            style={{ textShadow: '2px 2px 1px #000' }}
          >
            {hero.name}
          </p>
        </div>
      )}

      {/* Pick 状态指示器:静态小点,无脉冲发光。镜像时反向修正 */}
      {!isBan && (
        <div className={cn(
          'absolute right-2 top-2 z-30 h-2.5 w-2.5 rounded-full',
          isBlue ? 'bg-lol-blue' : 'bg-lol-red',
          mirrored && 'scale-x-[-1]',
        )} />
      )}
    </div>
  )
}

export default TeamSlot
