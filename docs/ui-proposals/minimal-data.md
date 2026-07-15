# 极简数据流 · UI 调整方案

> 面向硬核玩家与数据导向用户的视觉重构。去装饰、强信息密度，把分析面板从「配角」抬成「主角」。

---

## 1. 设计理念

**一句话定位**：把 BP 模拟器从「电竞氛围灯效秀」改成「战术终端」——像 Bloomberg 终端或 op.gg 那样，用排版、留白和数字本身承担表达，而非发光与渐变。

**适合场景**：
- 高频复盘 / 赛前研究的硬核玩家
- 数据导向用户（看胜率、协同、对阵差值做决策）
- 需要在单屏内同时看清「英雄池 + BP 进度 + 数据分析」的效率场景

**与现状的核心差异**：

| 维度 | 现状（游戏化） | 本方案（极简数据流） |
|------|---------------|---------------------|
| 视觉重心 | 中央 BP 竞技场（发光、渐变、玻璃态） | 右侧分析面板（图表/数字驱动） |
| 色彩 | 双队霓虹色 + 金色装饰 + 多层发光 | 中性灰阶为底 + 队伍色作语义标记 + 单一琥珀强调 |
| 发光 | `shadow-blue-lg` / `glow-pulse` 脉冲动画遍布 | 完全移除，改用 1px 边框 + 微妙底色分层 |
| 排版 | 纯 sans，字号靠 Tailwind 默认 | Inter（UI）+ JetBrains Mono（数据），强对比字号阶梯 |
| 信息密度 | 三列等宽、卡片大留白 | 左紧凑 / 中固定 / 右主导，KPI 行 + 表格 + 迷你图 |
| 动效 | `animate-glow` 脉冲 + `scale-105` 悬停 | 仅 150–200ms 颜色过渡，数据更新时一次性入场 |

---

## 2. 配色系统

**策略**：中性 zinc 灰阶作为「单色基调」（占屏幕 ~85%）；队伍蓝/红降饱和、去发光，降级为**语义编码**（只用在 1px 边框、小圆点、文字标签）；**一个琥珀强调色** `#f59e0b` 承担所有「数据高亮 / 当前焦点」职责，替换金色原本的装饰角色。

| 角色 | Hex | CSS 变量 | 映射说明（替换现状） |
|------|-----|---------|---------------------|
| 底色 base | `#09090b` | `--md-bg` | 替换 `bg-slate-950`。zinc-950 比 slate-950 更中性，去掉 slate 的蓝调偏差 |
| 表面 surface | `#131316` | `--md-surface` | 替换面板 `bg-slate-900/30`、`bg-slate-900/50`。不透明，放弃 backdrop-blur |
| 抬升 elevated | `#1c1c20` | `--md-elevated` | 替换卡片 `bg-slate-900/80`、`bg-slate-800/80` |
| 悬停 hover | `#26262b` | `--md-hover` | 替换 `hover:bg-slate-800` |
| 边框 subtle | `#27272a` | `--md-border-subtle` | 替换 `border-slate-800`（分割线、空槽虚线） |
| 边框 default | `#3f3f46` | `--md-border` | 替换 `border-slate-700`（卡片实边、输入框） |
| 边框 strong | `#52525b` | `--md-border-strong` | 替换 `hover:border-slate-600`（聚焦/悬停实边） |
| 文字 主 | `#e4e4e7` | `--md-text` | 替换 `text-slate-100/200`。主数据/标题 |
| 文字 次 | `#a1a1aa` | `--md-text-2` | 替换 `text-slate-400`。正文/次要标签 |
| 文字 弱 | `#71717a` | `--md-text-3` | 替换 `text-slate-500/600`。占位/说明 |
| 蓝队语义 | `#38bdf8` | `--md-side-blue` | 替换 `lol-blue #0ac8b9`。sky-400，更冷的数据蓝，去霓虹感 |
| 红队语义 | `#fb7185` | `--md-side-red` | 替换 `lol-red #f2385b`。rose-400，更柔的数据红 |
| 强调 accent | `#f59e0b` | `--md-accent` | **唯一强调色**，替换 `lol-gold #c8aa6e` 的装饰用途。用于当前阶段标记、图表高亮、关键 KPI。amber-500 |
| 强调亮 | `#fbbf24` | `--md-accent-bright` | accent 的文字/小标记变体（amber-400，暗底对比更佳） |
| 成功 | `#22c55e` | `--md-ok` | BP 完成 / 正向差值。green-500（仅状态，不作装饰） |
| 危险 | `#ef4444` | `--md-danger` | 错误提示。red-500 |

**为什么队伍色只降饱和不删除**：BP 模拟器的蓝/红是**功能性语义**（编码队伍归属），不是装饰。极简数据流的做法是保留语义、移除装饰——把发光填充换成 1px 边框 + 小色点，让颜色「携带信息」而非「制造氛围」。

**发光移除清单**（全部删除）：
- `tailwind.config.js` 的 `boxShadow.blue-sm/blue/blue-lg/red-*/gold-*` 全档位
- `animations.css` 的 `.animate-glow` / `.glow-blue` / `.glow-red` / `.glow-gold` 及 `glow-pulse` 关键帧
- 组件中所有 `shadow-blue*` / `shadow-red*` / `shadow-gold*` / `glow-*` / `animate-glow` 类名

---

## 3. 字体

| 用途 | 字体 | 权重 | 理由 |
|------|------|------|------|
| UI / 标题 / 正文 | **Inter** | 400 / 500 / 600 / 700 | 现代数据工具的事实标准（Linear、Vercel、Resend），暗底对比锐利，字怀开阔，长时间阅读不累 |
| 数据 / 数字 / 标签 | **JetBrains Mono** | 400 / 500 | 等宽对齐表格数字、胜率百分比、步数计数器；竖向对齐整齐；辨识度高于 Fira Code |

**Google Fonts 链接**：
```
https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap
```

**CSS 引入**（注意：`@import` 必须在 `globals.css` 所有 `@tailwind` 指令之前，否则 Vite 每次构建告警）：
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**字号阶梯**（强对比，数据为主角）：

| 层级 | 字号 | 字重 | 字体 | 用途 |
|------|------|------|------|------|
| KPI 数值 | `text-3xl` (30px) | 500 | JetBrains Mono | 分析面板核心数字（胜率、协同分） |
| 区块标题 | `text-sm` (14px) | 600 | Inter | 面板/卡片标题 |
| 正文/英雄名 | `text-xs` (12px) | 500 | Inter | 列表项、英雄名 |
| 标签/表头 | `text-[10px]` | 500 | Inter + `uppercase tracking-wider` | 「BAN」「PICK」「SYNERGY」等标签 |
| 数据辅助 | `text-[11px]` | 400 | JetBrains Mono | 百分比、步数 `7/20`、时间戳 |

> 备选（数据库首推）：Fira Code + Fira Sans，mood 完全契合 dashboard/analytics。若团队偏好 Fira 系，可直接替换，配置同理。本方案选 Inter + JetBrains Mono 是因其数据工具生态熟悉度更高。

---

## 4. 布局结构

**核心调整**：分析面板从 `w-96`（384px）升级为 `flex-1` 主导区；BP 竞技场从 `flex-1` 收为固定宽度；英雄池略收窄。视觉重量从「中间」迁移到「右侧」。

**宽度配比**（1440px 基准设计宽度）：
- 左 英雄池：`w-72`（288px，原 `w-80` 320px → 收窄 32px）
- 中 BP 竞技场：`w-[460px] flex-shrink-0`（原 `flex-1` → 固定，紧凑化）
- 右 分析面板：`flex-1`（原 `w-96` → 占据剩余 ~660px，成为主角）

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER  h-14                                                                  │
│  BP SIMULATOR · DATA VIEW          step 07/20  mono          v14.x · zh-CN   │
├────────────┬───────────────────────────────┬───────────────────────────────────┤
│ 英雄池      │  BP 竞技场                     │  分析面板  (flex-1 主角)          │
│ w-72       │  w-[460px] flex-shrink-0       │                                   │
│            │                               │  ┌─── KPI 行 (4 指标) ──────────┐ │
│ [搜索____] │  ▒▒▒▒▒▒▒▒░░░░  35%  07/20    │  │ 胜率   协同   对阵差   已用  │ │
│            │  BLUE · PICK                  │  │ 52.3%  78    +6      7/10  │ │
│ [标签 ▾]   │  ───────────────────          │  └──────────────────────────────┘ │
│            │                               │  推荐 PICK  (数据表行)             │
│ ┌──┐┌──┐  │  ┌ BLUE ──────┐ ┌ RED ───────┐│  hero     pos  wr%    score       │
│ │  ││  │  │  │ ● BAN  1-5  │ │ BAN  1-5 ● ││  ─────────────────────────        │
│ └──┘└──┘  │  │ □ □ □ ▣ □   │ │ □ ▣ □ □ □  ││  Vayne    ADC  53.1%   88         │
│ ┌──┐┌──┐  │  │ ● PICK 1-5  │ │ PICK 1-5 ● ││  Lulu     SUP  51.7%   84         │
│ │  ││  │  │  │ ▣ □ □ □ □   │ │ □ □ ▣ □ □  ││  ─────────────────────────        │
│ └──┘└──┘  │  └─────────────┘ └────────────┘│  协同矩阵  (迷你热力 5×5)          │
│   ...      │                               │  ┌───┬───┬───┬───┬───┐            │
│            │                               │  │   │ ░ │ ▓ │   │   │ 对阵优势   │
│ 共 162     │                               │  ├───┼───┼───┼───┼───┤ BLUE ▓▓▓░░ │
│ ●BAN ●PICK │                               │  │ ░ │ ▓ │ █ │ ▓ │ ░ │ RED  ░░▓▓▓ │
│            │                               │  └───┴───┴───┴───┴───┘            │
├────────────┴───────────────────────────────┴───────────────────────────────────┤
│ FOOTER h-14                                                                  │
│  [undo] [reset]                              [export] [import]                │
└──────────────────────────────────────────────────────────────────────────────┘
```

**图例**：`▣` 已填充槽位 · `□` 空槽位 · `●` 队伍色点 · `░▓█` 热力/优势渐变 · `▒` 进度条已填充

**header / footer 调整**：
- header 从 `h-16` 降到 `h-14`，去掉 `bg-slate-900/50` 半透明，改纯 `bg-zinc-950` + 底部 1px `border-zinc-900`。把阶段步数 `07/20`（mono 字体）提到 header 居中，作为全局数据焦点。
- footer 同理降到 `h-14`，按钮去圆角（`rounded-sm`）、去彩色填充，改 outline 风格。

---

## 5. 关键组件视觉

> 以下 Tailwind 类名均为**完整字面量**（遵守 CLAUDE.md 红线：禁止 `${}` 拼接，JIT 只扫描字面量）。ban/pick、blue/red 的颜色分支用三元字面量或字面量查表对象。

### 5.1 英雄卡片 HeroCard（紧凑、去发光）

**视觉**：方角卡片、1px 边框、64px 头像保留、名称压到 `text-[11px]`。可交互态仅边框 + 底色微变；禁用态降透明 + 删除线小标，不做重度灰度。

可交互（当前阶段，pick 操作）：
```tsx
// 字面量三元：ban 走 rose 边框，pick 走 sky 边框——不可拼接
const accent = actionType === 'ban'
  ? 'border-zinc-800 hover:border-rose-400/60 hover:bg-rose-950/20'
  : 'border-zinc-800 hover:border-sky-400/60 hover:bg-sky-950/20'

<div className={cn(
  'relative flex aspect-square flex-col items-center justify-center',
  'rounded-sm border bg-zinc-900/60 p-1.5',
  'transition-colors duration-150 ease-out cursor-pointer',
  accent
)}>
  <img className="h-14 w-14 object-contain" />
  <span className="mt-1 text-center text-[11px] font-medium text-zinc-300 line-clamp-1">
    {hero.name}
  </span>
</div>
```

禁用态（已被选）：
```tsx
'rounded-sm border border-zinc-900 bg-zinc-950/60 opacity-40 cursor-not-allowed'
```

非当前阶段（灰显但可观察）：
```tsx
'rounded-sm border border-zinc-900 bg-zinc-950/40 opacity-50 cursor-not-allowed'
```

**操作角标**：去掉发光脉冲 `animate-glow`，改静态 2px 色条贴在卡片左侧（数据工具常见的状态条手法）：
```tsx
// 状态条放在卡片内 absolute left-0 top-0 bottom-0 w-0.5
isBan ? 'bg-rose-400' : 'bg-sky-400'
```

### 5.2 BP 槽位 TeamSlot（极简、无阴影）

**视觉**：方角、1px 边框、头像 40px、`text-[10px]` 名称。完全移除 `shadow-blue-sm` / `shadow-red-sm`。空槽用虚线 + 序号（mono）。

已填充 pick 槽（蓝方）：
```tsx
<div className={cn(
  'aspect-square rounded-sm border flex flex-col items-center justify-center',
  'bg-zinc-900 border-sky-500/40 transition-colors duration-200',
  isBlue ? 'border-sky-500/40' : 'border-rose-400/40'   // 字面量三元
)}>
  <img className="h-9 w-9 object-contain" />
  <span className={cn(
    'mt-0.5 text-[10px] font-medium truncate w-full text-center px-0.5',
    isBlue ? 'text-sky-300' : 'text-rose-300'            // 字面量三元
  )}>{hero.name}</span>
</div>
```

ban 槽（已填充，统一中性灰，弱化处理）：
```tsx
'aspect-square rounded-sm border border-zinc-800 bg-zinc-950/60 opacity-70'
```

空槽：
```tsx
'aspect-square rounded-sm border border-dashed border-zinc-800 bg-zinc-950/40 flex items-center justify-center'
// 序号用 mono：
<span className="font-mono text-[10px] text-zinc-700">{index + 1}</span>
```

**队伍容器**：去掉 `bg-gradient-to-b`、`backdrop-blur-sm`、`shadow-blue-sm`，改纯色面板 + 顶部 2px 队伍色条：
```tsx
<section className={cn(
  'rounded-sm border border-zinc-800 bg-zinc-950/40 p-4',
  'border-t-2',                                          // 顶部色条加粗
  isBlue ? 'border-t-sky-500/60' : 'border-t-rose-400/60' // 字面量三元
)}>
  <header className="mb-3 flex items-center gap-2">
    <span className={cn('h-1.5 w-1.5 rounded-full', isBlue ? 'bg-sky-400' : 'bg-rose-400')} />
    <h3 className="text-sm font-semibold text-zinc-200">{t('bp.blueTeam')}</h3>
    <span className="ml-auto font-mono text-[11px] text-zinc-500">{picks.length}/5</span>
  </header>
```

### 5.3 阶段指示器（扁平、mono 驱动）

**视觉**：去掉 `bg-gradient-to-r`、`backdrop-blur-sm`、`border-slate-700/50`。进度条压到 `h-0.5`（2px），轨道 `bg-zinc-800`，填充用**强调色** `bg-amber-500`（当前焦点统一用 accent，不再用队伍色）。当前队伍用小标签，不再用大号发光色块。

```tsx
<div className="mb-5 border-b border-zinc-900 pb-4">
  <div className="mb-2 flex items-center justify-between">
    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
      {t('bp.phase')}
    </span>
    <span className="font-mono text-[11px] text-zinc-400">
      {String(step).padStart(2,'0')} / {total}
    </span>
  </div>
  {/* 2px 扁平进度条 */}
  <div className="h-0.5 w-full bg-zinc-800">
    <div
      className="h-full bg-amber-500 transition-all duration-300 ease-out"
      style={{ width: `${pct}%` }}
    />
  </div>
  {phase && (
    <div className="mt-2 flex items-center gap-2">
      <span className={cn(
        'rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        phase.side === 'blue'
          ? 'bg-sky-500/15 text-sky-300'      // 字面量
          : 'bg-rose-400/15 text-rose-300'    // 字面量
      )}>
        {t(`bp.${phase.side}Team`)}
      </span>
      <span className="text-sm font-semibold text-zinc-100">{t(`bp.${phase.action}Hero`)}</span>
    </div>
  )}
</div>
```

### 5.4 分析卡片 + 数据可视化（主角）

**KPI 行**（顶部 4 指标，mono 大数字）：
```tsx
<div className="grid grid-cols-4 gap-px bg-zinc-800 mb-4">
  {metrics.map(m => (
    <div key={m.key} className="bg-zinc-950 p-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{m.label}</div>
      <div className="mt-1 font-mono text-2xl font-medium text-zinc-100">
        {m.value}<span className="text-sm text-zinc-500">{m.unit}</span>
      </div>
      {/* 与基线对比的迷你箭头 */}
      <div className={cn(
        'mt-0.5 font-mono text-[10px]',
        m.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'   // 字面量三元
      )}>
        {m.delta >= 0 ? '▲' : '▼'} {Math.abs(m.delta)}
      </div>
    </div>
  ))}
</div>
```

**推荐列表（表格行，替代卡片）**：
```tsx
// 表头
<div className="grid grid-cols-[1fr_48px_64px_56px] gap-2 px-2 py-1.5
                text-[10px] uppercase tracking-wider text-zinc-600 border-b border-zinc-900">
  <span>Hero</span><span>Pos</span><span className="text-right">WR</span><span className="text-right">Score</span>
</div>
// 行
<div className="grid grid-cols-[1fr_48px_64px_56px] gap-2 px-2 py-2
                border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors duration-150 cursor-pointer">
  <span className="text-xs font-medium text-zinc-200">{rec.name}</span>
  <span className="font-mono text-[11px] text-zinc-500">{rec.pos}</span>
  <span className="font-mono text-[11px] text-right text-zinc-300">{rec.wr.toFixed(1)}%</span>
  <span className="font-mono text-[11px] text-right text-amber-400">{rec.score}</span>
</div>
```

**胜率 Bullet 条**（迷你横向条，纯 CSS，无需图表库）：
```tsx
<div className="relative h-1 w-full bg-zinc-800 rounded-full">
  {/* 50% 目标标记线 */}
  <div className="absolute inset-y-[-2px] left-1/2 w-px bg-zinc-600" />
  {/* 实际值条 */}
  <div
    className={cn(
      'absolute inset-y-0 left-0 rounded-full',
      rec.wr >= 50 ? 'bg-emerald-500/70' : 'bg-rose-400/70'   // 字面量三元
    )}
    style={{ width: `${rec.wr}%` }}
  />
</div>
```

**对阵优势条**（双向 divergent 条，蓝正红负）：
```tsx
<div className="flex h-2 items-center">
  <div className="flex-1 flex justify-end">
    <div className="h-full bg-sky-500/70" style={{ width: `${blueAdv}%` }} />
  </div>
  <div className="w-px h-3 bg-zinc-600" />
  <div className="flex-1">
    <div className="h-full bg-rose-400/70" style={{ width: `${redAdv}%` }} />
  </div>
</div>
```

> 数据可视化全部用 `div` + `width:%` 实现，**零新增依赖**。未来若接入真实分析数据且需交互式图表，推荐 Recharts（声明式、React 友好）；当前 AnalysisPanel 仍是 stub，先用纯 CSS 把视觉骨架立起来。

---

## 6. 交互与动效

**总原则**（来自 UX 数据库 motion 规则）：单屏最多 1–2 个动效元素；微交互 150–300ms；进入用 `ease-out`、退出用 `ease-in`；绝不 `linear`；尊重 `prefers-reduced-motion`。

| 元素 | 触发 | 效果 | 时长 / 缓动 |
|------|------|------|------------|
| 英雄卡片 | hover | 边框色 + 底色变化（无 scale） | `duration-150 ease-out` |
| BP 槽位填充 | 数据更新 | 一次性 `opacity 0→1` + `translateY 4px→0` | `duration-200 ease-out` |
| 进度条 | step 变化 | width 过渡 | `duration-300 ease-out` |
| 分析行 | hover | 底色 `bg-zinc-900/50` | `duration-150` |
| KPI 数字 | 值变化 | 纯色切换，无 count-up（数据工具不搞花活） | 无 |
| 推荐/分析入场 | 列表渲染 | 依次 `slide-in-up`，错峰 50ms | `duration-200`，`animation-delay` |

**删除的动效**：
- `animate-glow`（脉冲发光）—— 全删
- `hover:scale-105` / `active:scale-100` / `.hover-scale` —— 全删（数据 UI 不缩放）
- `animate-pulse`（loading 除外，保留 spinner）

**reduced-motion 守护**（`animations.css` 追加）：
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**保留的入场动画**（`tailwind.config.js` 现有 keyframes 可复用，仅去掉 glow）：
- `animate-fade-in`（300ms）
- `animate-slide-in-up`（300ms，用于列表项入场）

---

## 7. Tailwind 实现要点

### 7.1 新增 / 修改 token

**好消息**：本方案主色全部落在 Tailwind 内置调色板（zinc / sky / rose / amber / emerald），**几乎不需要新增自定义颜色 token**，迁移成本因此显著降低。

`tailwind.config.js` 改动：
```js
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    },
    colors: {
      // 删除全部 lol-* 颜色，或保留作 deprecated 别名指向新值
      // 队伍语义色（可选，也可直接用 sky-/rose-）
      'side-blue': '#38bdf8',
      'side-red': '#fb7185',
    },
    // 删除 boxShadow 全部 blue-*/red-*/gold-* 档位（极简方案不用发光）
    // 删除 keyframes 中已被 glow 使用的部分（fade-in / slide-in-up / scale-in 保留）
  }
}
```

`design-system.css` 改动：把 `--lol-*` 变量替换为 `--md-*`（见第 2 节表格），或直接在组件里用 zinc/sky/rose/amber 字面量。

### 7.2 必须遵守的 Tailwind 坑（来自 CLAUDE.md，迁移时逐一核对）

1. **禁止 `${}` 拼接类名**。JIT 只扫描完整字面量。颜色分支一律用三元字面量：
   ```tsx
   // ✅ 正确
   isBan ? 'border-rose-400/60' : 'border-sky-400/60'
   // ❌ 错误（静默不生成 CSS）
   `border-${isBan ? 'rose' : 'sky'}-400/60`
   ```
   本方案所有 ban/pick、blue/red 分支均已按此写法给出（见第 5 节）。

2. **自定义 `boxShadow` 档位不支持 `/N` 透明度修饰符**。本方案**直接删除全部自定义 boxShadow**，改用标准 `border` + 底色分层，从根上规避此坑。若未来要加微妙阴影，必须成对：`shadow-md shadow-amber-500/20`（颜色阴影必须配尺寸类，否则只设 `--tw-shadow-color` 不渲染）。

3. **颜色阴影单独使用不渲染**。`shadow-sky-500/40` 单写无效，必须配 `shadow` / `shadow-md` / `shadow-lg`。本方案原则上不用阴影；如需层级感，用底色明度差（zinc-950 → zinc-900 → zinc-800）替代。

4. **改 `tailwind.config.js` 必须重启 Vite**。HMR 不重载 Tailwind config，改完不重启会「看起来没生效」。迁移时改一次 config 重启一次。

5. **`@import` 必须在 `@tailwind` 之前**。引入 Inter / JetBrains Mono 的 `@import url(...)` 放在 `globals.css` 第一行，否则 Vite 每次构建告警，未来版本可能静默丢 CSS。

### 7.3 迁移类名速查（全局替换映射）

| 现状类名 | 本方案替换 | 说明 |
|---------|-----------|------|
| `bg-slate-950` | `bg-zinc-950` | 底色，去蓝调 |
| `bg-slate-900/*` | `bg-zinc-900` 或 `bg-[#131316]` | 面板/卡片 |
| `border-slate-800` | `border-zinc-800` 或 `border-[#27272a]` | 分割线 |
| `border-slate-700` | `border-zinc-700` 或 `border-[#3f3f46]` | 实边 |
| `text-slate-100/200` | `text-zinc-200` | 主文字 |
| `text-slate-400` | `text-zinc-400` 或 `text-zinc-500` | 次文字 |
| `text-slate-500/600` | `text-zinc-500` 或 `text-zinc-600` | 弱文字 |
| `lol-blue` / `lol-blue-glow` | `sky-400` / `sky-500` | 蓝队语义 |
| `lol-red` / `lol-red-glow` | `rose-400` / `rose-500` | 红队语义 |
| `lol-gold` | `amber-500` / `amber-400` | 强调色（唯一） |
| `shadow-blue*` / `shadow-red*` / `shadow-gold*` | （删除） | 去发光 |
| `glow-blue` / `glow-red` / `glow-gold` / `animate-glow` | （删除） | 去脉冲 |
| `backdrop-blur-sm` | （删除） | 去玻璃态，纯色面板 |
| `bg-gradient-to-*` | （删除） | 去渐变 |
| `rounded` / `rounded-lg` | `rounded-sm` | 收圆角，更利落 |
| `hover:scale-105` | （删除） | 数据 UI 不缩放 |

> 建议用全局搜索替换 + 逐文件人工核对。由于类名是字面量，`grep -r "lol-blue"` 能精确列出所有待改点。

---

## 8. 迁移成本评估

**评级：中**

**为什么不是低**：
- 几乎每个组件（HeroCard / HeroGrid / BanPickArena / TeamSlot / AnalysisPanel / App.tsx）的 className 字符串都要重写
- `tailwind.config.js` 删除 boxShadow / lol-* 颜色、加 fontFamily
- `design-system.css` + `animations.css` 重写 CSS 变量、删 glow 动画
- 布局比例调整（三面板宽度重分配）涉及 App.tsx 结构

**为什么不是高**：
- **零逻辑改动**：所有 Context（Hero/BP/Data）、IPC、i18n、类型系统、BP 阶段规则完全不动
- **零新增依赖**：颜色落在 Tailwind 内置调色板，数据可视化用纯 CSS div，字体走 Google Fonts CDN
- **测试不受影响**：组件测试 mock 的是 `react-i18next` 和 `electronAPI`，断言基于角色/文本而非类名（现有测试不检查 CSS 类），视觉重构不会破坏测试
- **可复用资产**：
  - `fade-in` / `slide-in-up` / `scale-in` keyframes 保留复用
  - HeroCard 的图片加载 / 错误处理逻辑、TeamSlot 的 hero 解析逻辑、所有 IPC 调用原样保留
  - cn() 工具、字面量三元写法范式（CLAUDE.md 已建立的规范）直接延续
  - 三面板 + header/footer 结构骨架不变，只调宽度和填充

**建议迁移顺序**（小步可验证，每步后 `pnpm dev` 看效果）：
1. 字体：`index.html` / `globals.css` 引入 Inter + JetBrains Mono，config 加 fontFamily
2. 底色：全局 `slate-*` → `zinc-*`（App.tsx + 所有组件）
3. 去发光：删 `tailwind.config.js` 的 boxShadow、`animations.css` 的 glow，清组件里的 `shadow-*` / `glow-*` 类
4. 队伍色：`lol-blue/red` → `sky/rose`，收窄到边框 + 小色点
5. 强调色：原 `lol-gold` 装饰位 → `amber-500`，统一用于当前阶段 / 图表高亮
6. 布局：App.tsx 三面板宽度重分配（`w-72` / `w-[460px] flex-shrink-0` / `flex-1`）
7. 分析面板：搭 KPI 行 + 表格行 + bullet 条骨架（数据待 stub 实现后接入）
8. 动效收尾：删 `scale-105`，加 `prefers-reduced-motion` 守护

---

## 附：设计依据来源

本方案配色、字体、图表选型由 ui-ux-pro-max 技能数据库返回：
- **风格**：Data-Dense Dashboard（density 8/10，多图表/数据表/KPI 卡/最小留白）
- **图表**：Bullet Chart（KPI 对比目标）、Gauge（单指标）、Line Chart（趋势），均标注 WCAG AA/AAA、数值始终可见不依赖颜色
- **字体配对**：Dashboard Data（Fira Code + Fira Sans）为数据库首推；本方案改用 Inter + JetBrains Mono（同属 data/analytics/precise mood，生态熟悉度更高）
- **UX 动效规则**：150–300ms、ease-out 进入、respect prefers-reduced-motion、单屏 ≤2 动效元素
- **暗色高对比配色参考**：Analytics Dashboard（blue + amber accent）、Financial Dashboard（dark bg + 语义色指标）
