# 玻璃拟态深空（Glass Deep Space）UI 全面调整方案

> 目标：在不改变现有功能（三面板 / 导入导出 / 分析逻辑 / BP 流程）的前提下，将 Ban/Pick 模拟器的视觉语言从"硬游戏化"迁移到"现代精致的毛玻璃深空"。
>
> 资源依据：本方案的设计令牌综合自 `ui-ux-pro-max` 设计库匹配结果——`--design-system` 返回的 Inter/深色/精密基调，叠加 `--domain style` 命中度最高的两类：**Modern Dark (Cinema)**（深空黑 + 靛紫高光 + 环境光斑 + BlurView）与 **Glassmorphism**（`backdrop-blur` + 半透明白叠加 + 细边），并由 **Bitcoin DeFi** 的"void 背景 + 发光 CTA"补充深空层次。

---

## 1. 设计理念

**一句话定位**：面板如悬浮于深空之中的磨砂玻璃卡片，以柔和内发光与层次纵深替代硬边框与霓虹脉冲，让 BP 信息在克制中获得高级感。

**适合场景**：桌面端长时间凝视的工具型应用——BP 模拟器以"看清信息、轻量操作"为主，玻璃拟态深空能降低视觉疲劳、强化信息层级，区别于竞技对战瞬间的强刺激界面。

**与现状差异**：

| 维度 | 现状（硬游戏化） | 玻璃拟态深空 |
|------|----------------|------------|
| 背景 | 纯色 `slate-950` 平铺 | 紫黑/蓝黑深空渐变 + 微弱星点 + 环境光斑 |
| 面板边界 | `border-slate-800` 硬边 + 纯色底 | `border-white/10` 细发丝边 + `bg-white/5` + `backdrop-blur` |
| 发光 | 高强度霓虹 `shadow-blue-lg` + 2s 脉冲 | 低饱和内发光（`inset`）+ 仅活跃元素外发光 |
| 层次 | 扁平、靠颜色块区分 | 玻璃透明叠加 + 模糊景深 + 顶部高光 |
| 风格情绪 | 紧张、竞技、刺激 | 精致、克制、专业 |

---

## 2. 配色系统

设计原则：**保留 `lol-blue / lol-red / lol-gold` 语义令牌**（它们承担蓝/红队伍识别，不可删），但把它们从"主色块"降级为"点缀发光色"；背景与表面改用深空渐变 + 中性玻璃白。

### 2.1 深空背景层（新增）

| 角色 | Hex / 值 | CSS 变量 | 说明 |
|------|----------|----------|------|
| 深空极深处 | `#04030c` | `--ds-bg-void` | 应用根底色，比现状 `slate-950` 更偏紫黑 |
| 深空底（渐变中段） | `#0a0820` | `--ds-bg-deep` | 蓝紫黑，主背景渐变起点 |
| 深空抬升（渐变末段） | `#15102e` | `--ds-bg-elevated` | 紫黑，营造由上至下的纵深 |
| 蓝色环境光斑 | `rgba(10, 200, 185, 0.10)` | `--ds-blob-blue` | 模糊光团，缓慢漂浮 |
| 紫色环境光斑 | `rgba(109, 93, 252, 0.12)` | `--ds-blob-purple` | 主氛围光，铺满右上 |
| 红色环境光斑 | `rgba(242, 56, 91, 0.08)` | `--ds-blob-red` | 弱红点缀，平衡画面 |
| 星点 | `rgba(255,255,255,0.35)` | `--ds-star` | `radial-gradient` 极小点，opacity 极低 |

**深空背景实现**（写入 `globals.css` 的 `body`，替换 `bg-slate-950`）：

```css
body {
  background:
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.35), transparent),   /* 星点 */
    radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.25), transparent),
    radial-gradient(1px 1px at 85% 15%, rgba(255,255,255,0.30), transparent),
    radial-gradient(1200px 800px at 80% 0%, var(--ds-blob-purple), transparent),
    radial-gradient(900px 600px at 0% 100%, var(--ds-blob-blue), transparent),
    radial-gradient(700px 500px at 100% 100%, var(--ds-blob-red), transparent),
    linear-gradient(180deg, var(--ds-bg-deep) 0%, var(--ds-bg-elevated) 60%, var(--ds-bg-void) 100%);
  background-attachment: fixed;
}
```

### 2.2 玻璃表面层（新增）

| 角色 | 值 | CSS 变量 | 用途 |
|------|----|----------|------|
| 玻璃面板底 | `rgba(255,255,255,0.05)` | `--ds-glass` | 三大面板 / 卡片 |
| 玻璃抬升 | `rgba(255,255,255,0.08)` | `--ds-glass-strong` | 悬浮卡片 / 当前阶段卡 |
| 玻璃边（发丝） | `rgba(255,255,255,0.10)` | `--ds-border-glass` | 默认边框 |
| 玻璃边（聚焦/活跃） | `rgba(255,255,255,0.18)` | `--ds-border-glow` | hover / focus |
| 顶部高光 | `rgba(255,255,255,0.08)` | `--ds-highlight` | 卡片顶部 1px 内阴影，模拟光 |

### 2.3 文本色（替换 slate-* 语义）

| 角色 | Hex | CSS 变量 | 替换 |
|------|-----|----------|------|
| 主前景 | `#EDEDEF` | `--ds-fg` | `text-slate-100` |
| 次要文字 | `#A0A4B0` | `--ds-fg-muted` | `text-slate-400` |
| 弱化文字 | `#6B7080` | `--ds-fg-dim` | `text-slate-500/600` |

### 2.4 队伍强调色（复用现有令牌，软化处理）

| 角色 | Hex | 现有变量 | 新增软化变量 | 用途变化 |
|------|-----|---------|------------|---------|
| 蓝方主色 | `#0ac8b9` | `--lol-blue-primary` | `--ds-blue-glow: rgba(10,200,185,0.25)` | 由"大块底色"改为"细描边 + 内发光" |
| 蓝方高光 | `#00d4ff` | `--lol-blue-glow` | — | 仅用于渐变进度条末段 |
| 红方主色 | `#f2385b` | `--lol-red-primary` | `--ds-red-glow: rgba(242,56,91,0.25)` | 同上 |
| 红方高光 | `#ff5c7c` | `--lol-red-glow` | — | 同上 |
| 金色装饰 | `#c8aa6e` | `--lol-gold` | `--ds-gold-glow: rgba(200,170,110,0.25)` | 用于协同度数字 / 高优先级标签 |
| 深空紫（辅助） | `#6d5dfc` | （新增） | `--ds-purple: #6d5dfc` | 进度条中段 / 分析 CTA 备选 |

**映射结论**：`lol-blue/red/gold` 三个 Tailwind 颜色 token **保留不动**，组件里继续用 `text-lol-blue` / `border-lol-blue/30` 等字面量；只是大面积的 `bg-lol-blue`（如阶段徽标底）改为 `bg-white/10` + `text-lol-blue` + 内发光，让玻璃质感主导。

---

## 3. 字体

> `--design-system` 返回的 Inter/Inter 配对偏通用；结合 Cinema/Bitcoin DeFi 案例的"精密、高级"基调，本方案采用 **Space Grotesk + Inter + JetBrains Mono** 三件套，兼顾深空科技感与中文兼容。

| 角色 | 字体 | Google Fonts | 理由 |
|------|------|-------------|------|
| 标题 / 阶段徽标 | **Space Grotesk** | [fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap) | 几何无衬线，字形开阔、带未来感，"Space"之名与深空主题契合；优于 Inter 的辨识度 |
| 正文 / 按钮 | **Inter** | [fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap) | 屏幕阅读最佳无衬线，小字号清晰，中英文混排稳定 |
| 数字 / 进度 / 步数 | **JetBrains Mono** | [fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap](https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap) | 等宽，阶段 `7/20`、胜率 `52.3%` 等数字对齐美观 |

**引入方式**（在 `globals.css` 最顶部，`@tailwind` 之前）：

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@import './design-system.css';
@import './animations.css';
@tailwind base;
```

> 注意：`@import` 必须先于 `@tailwind`（见 CLAUDE.md 既有坑），否则 Vite 报 `@import must precede all other statements`。

`tailwind.config.js` 增加：

```js
fontFamily: {
  display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
},
```

> 中文回退：英雄名等中文走 `Inter` → 系统 `sans-serif`（PingFang/Microsoft YaHei），无需额外引入中文字体。

---

## 4. 布局结构

三面板功能与宽度**完全保留**（`w-80` / `flex-1` / `w-96`），改造重点：面板从"贴边分割"变为"悬浮玻璃卡片"——面板与 header/footer 之间留出 `gap`，透出底层深空渐变与光斑。

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ░░ 深空背景（紫黑/蓝黑渐变 + 环境光斑 ◯◯◯ + 微弱星点 · · ·）░░             │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ HEADER  玻璃条 (bg-white/5 backdrop-blur-xl border-white/10)          │ │
│ │  ◆ Ban/Pick Simulator                                  ● Live       │ │
│ ├──────────────┬─────────────────────────────────────┬──────────────────┤ │
│ │              │ ╭── 阶段指示器 (玻璃卡) ───────────╮ │                  │ │
│ │  英雄网格     │ │ ● Blue · Pick    ▓▓▓░░░░ 7/20    │ │   分析面板        │ │
│ │  (玻璃卡)     │ ╰──────────────────────────────────╯ │   (玻璃卡)       │ │
│ │              │                                     │                  │ │
│ │  🔍 搜索框    │  ┌── 蓝方 (玻璃) ──┐  ┌── 红方 ──┐  │   ▢ 推荐列表      │ │
│ │  ▣ 标签筛选   │  │ ◌◌◌ ban ◌◌      │  │ ◌◌◌ ban  │  │   ▢ 协同度        │ │
│ │  ┌──┬──┬──┐ │  │ ◼◼◼◼◼ pick      │  │ ◼◼◼◼◼    │  │   ▢ 对阵优势      │ │
│ │  │▢ │▢ │▢ │ │  └─────────────────┘  └──────────┘  │                  │ │
│ │  ├──┼──┼──┤ │                                     │                  │ │
│ │  │▢ │▢ │▢ │ │                                     │                  │ │
│ │  └──┴──┴──┘ │                                     │                  │ │
│ ├──────────────┴─────────────────────────────────────┴──────────────────┤ │
│ │ FOOTER  玻璃条       [Undo][Reset]            [Export][Import]        │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
   面板间隙透出深空，形成"卡片悬浮"层次
```

**关键布局调整**（`App.tsx`）：

| 元素 | 现状类名 | 调整后类名 |
|------|---------|-----------|
| 根容器 | `bg-slate-950` | 移除（深空渐变由 `body` 承担），加 `p-3` 让卡片悬浮留白 |
| Header | `bg-slate-900/50 border-slate-800` | `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl` |
| 左面板 | `bg-slate-900/30 border-r border-slate-800` | `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl` |
| 中面板 | `flex-1 p-6`（无背景） | `bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl` |
| 右面板 | `bg-slate-900/30 border-l border-slate-800` | `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl` |
| Footer | `bg-slate-900/50 border-t border-slate-800` | `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl` |
| 主区 | `flex h-[calc(100vh-8rem)]` | 改为 `flex h-[calc(100vh-8rem)] gap-3`（卡片间透出深空） |

---

## 5. 关键组件视觉

### 5.1 英雄卡片 `HeroCard`（玻璃态化）

把当前的 `bg-slate-900/80 border-2` 改为玻璃底 + 顶部高光内阴影 + 柔和 hover 发光。

```tsx
// 可交互 pick 状态（替换 getCardStyle 的 accent 分支）
const accent = actionType === 'ban'
  ? 'hover:border-lol-red/50 hover:shadow-[0_0_24px_rgba(242,56,91,0.22)]'
  : 'hover:border-lol-blue/50 hover:shadow-[0_0_24px_rgba(10,200,185,0.22)]'

return cn(
  'relative aspect-square rounded-xl p-2',
  'bg-white/5 backdrop-blur-md border border-white/10',                 // 玻璃底
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',                      // 顶部高光
  'hover:bg-white/10 transition-all duration-200 ease-out',             // 提亮
  'hover:scale-[1.04] active:scale-100 cursor-pointer',
  'animate-fade-in',
  accent,                                                                // 队伍色发光
)
```

- 不可选状态：`bg-white/[0.02] border-white/5 opacity-40 grayscale`（替换 `bg-slate-900/80`）。
- ban/pick 徽标：底色 `bg-lol-red/80` 保留但加 `backdrop-blur-sm border border-white/20`，发光强度从 `animate-glow` 降为常驻 `shadow-[0_0_12px_rgba(242,56,91,0.6)]`（减少脉冲，更克制）。

### 5.2 BP TeamSlot（半透明内发光）

这是玻璃深空的灵魂——空槽与已填槽都用内发光代替硬描边。

```tsx
// 空槽（替换 border-dashed 分支）
cn(
  'aspect-square rounded-lg',
  'bg-white/[0.03] backdrop-blur-sm border border-white/10',
  isBan
    ? 'shadow-[inset_0_0_12px_rgba(255,255,255,0.03)]'
    : (isBlue
        ? 'shadow-[inset_0_0_14px_rgba(10,200,185,0.12)] border-lol-blue/20'
        : 'shadow-[inset_0_0_14px_rgba(242,56,91,0.12)] border-lol-red/20'),
)
```

```tsx
// 已填 pick 槽（替换 bg-slate-900/50 分支）
cn(
  'aspect-square rounded-lg overflow-hidden',
  'bg-white/5 backdrop-blur-md border border-white/15',
  isBlue
    ? 'shadow-[inset_0_0_18px_rgba(10,200,185,0.18)] ring-1 ring-lol-blue/25'
    : 'shadow-[inset_0_0_18px_rgba(242,56,91,0.18)] ring-1 ring-lol-red/25',
)
```

- 已填 ban 槽：`bg-white/[0.03] backdrop-blur-sm border border-white/10`（弱化，禁用感）。
- 关键点：用 `shadow-[inset_...]` 任意值做内发光，绕开"自定义 boxShadow 不支持 `/N`"的坑。

### 5.3 阶段指示器（玻璃条 + 柔和进度）

```tsx
// 替换 from-slate-900/80 to-slate-800/80 容器
cn(
  'mb-6 rounded-2xl p-4',
  'bg-white/5 backdrop-blur-xl border border-white/10',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
)
```

- 进度条：底 `bg-white/10`，填充由 `from-lol-blue to-lol-blue-glow` 改为 `from-lol-blue/80 via-[#6d5dfc] to-lol-blue-glow`（中段加深空紫渐变）。
- 当前队伍徽标：`bg-lol-blue text-lol-darker` 改为 `bg-white/10 text-lol-blue backdrop-blur-md border border-lol-blue/40 shadow-[0_0_20px_rgba(10,200,185,0.4)]`（玻璃徽标 + 外发光，弱化大块纯色）。

### 5.4 分析卡片（玻璃列表项）

```tsx
// 推荐列表项（替换 bg-slate-900/60 border-slate-700/50）
cn(
  'rounded-xl p-3',
  'bg-white/5 backdrop-blur-md border border-white/10',
  'hover:bg-white/10 hover:border-white/20',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
  'transition-all duration-200 cursor-pointer',
  'animate-slide-in-up',
)
```

- 优先级标签保留 `bg-lol-red/20 text-lol-red` 语义色，但加 `backdrop-blur-sm border border-white/10`。
- 协同度数字 `text-lol-gold` 保留，字族改 `font-mono`。
- 分析按钮：`bg-lol-blue` 改为 `bg-lol-blue/90 backdrop-blur-md border border-lol-blue/50 shadow-[0_0_24px_rgba(10,200,185,0.35)]`，保留现有 `btn-game` 高光伪元素。

### 5.5 按钮（Footer + 搜索标签）

```tsx
// Footer 主按钮（替换 bg-blue-600 / bg-green-600 / bg-slate-700）
// 导出：玻璃强调
'rounded-xl px-4 py-2 text-sm font-medium backdrop-blur-md border transition-all duration-200',
'bg-white/10 border-white/15 text-slate-100 hover:bg-white/15 hover:border-white/25'

// 危险/重置：玻璃弱化
'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10'

// 强调 CTA（分析按钮）：保留 lol-blue 但玻璃化
'bg-lol-blue/15 border-lol-blue/40 text-lol-blue hover:bg-lol-blue/25'
```

---

## 6. 交互与动效

| 交互 | 效果 | 时长 / 缓动 | 实现 |
|------|------|------------|------|
| 卡片 hover | 玻璃提亮 `bg-white/5 → bg-white/10` + 边框 `border-white/10 → /20` | `200ms ease-out` | `transition-all duration-200` |
| 卡片 hover | 柔和队伍色外发光 | `200ms` | `hover:shadow-[0_0_24px_rgba(...)]`（任意值） |
| 卡片 press | 轻缩放回弹 | `150ms` | `active:scale-100`（hover 已 `scale-[1.04]`） |
| 空槽→已填 | 内发光渐显 | `300ms ease-out` | `transition-all duration-300` |
| 当前队伍徽标 | 常驻低强度发光（取代高频脉冲） | — | 静态 `shadow-[0_0_20px_...]`，去掉 `animate-glow` 高频 |
| 环境光斑漂浮 | 极慢位移（可选） | `20-30s linear infinite` | 见下方"环境光斑动画" |
| 进度条 | 宽度过渡（已有） | `300ms` | 保留现状 |
| 列表项入场 | 错峰上滑（已有） | `animate-slide-in-up` | 保留现状 |

**环境光斑漂浮（可选，锦上添花）**——在 `animations.css` 新增，作用于 body 伪元素或独立 div：

```css
@keyframes blob-drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(40px, -30px); }
}
```

**`prefers-reduced-motion` 兜底**（必须，CLAUDE.md 既有要求）：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  /* 关闭背景光斑漂浮与 backdrop 动画，但保留静态玻璃外观 */
  body { background-attachment: fixed; }
}
```

---

## 7. Tailwind 实现要点

### 7.1 新增 token（`tailwind.config.js` 的 `theme.extend`）

```js
extend: {
  colors: {
    // 保留现有 lol-* 不动
    'ds-void': '#04030c',
    'ds-deep': '#0a0820',
    'ds-elevated': '#15102e',
    'ds-purple': '#6d5dfc',
    'ds-fg': '#EDEDEF',
    'ds-fg-muted': '#A0A4B0',
    'ds-fg-dim': '#6B7080',
  },
  fontFamily: {
    display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
  },
  backdropBlur: {
    xs: '4px',
    // md/lg/xl Tailwind 已自带
  },
  boxShadow: {
    // 玻璃内发光档（替代原硬发光，命名独立避免与 /N 坑冲突）
    'glass-sm': 'inset 0 1px 0 rgba(255,255,255,0.06)',
    'glass': 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 12px rgba(255,255,255,0.03)',
    'glass-blue': 'inset 0 0 18px rgba(10,200,185,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
    'glass-red': 'inset 0 0 18px rgba(242,56,91,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  // animation / keyframes 保留现状，可新增 blob-drift
}
```

### 7.2 必须遵守的既有坑（来自 CLAUDE.md）

1. **类名必须完整字面量，禁止 `${}` 插值**。JIT 只扫描字面量；队伍色分支继续用现有写法——字面量三元：
   ```tsx
   // 正确
   isBlue ? 'shadow-glass-blue' : 'shadow-glass-red'
   // 错误（JIT 不生成）
   `shadow-glass-${side}`
   ```

2. **自定义 `boxShadow` 不支持 `/N` 透明度修饰符**。`shadow-glass-blue/40` 会被误解析为阴影颜色染色、发光失效。需要不同强度就单独建 key（如上 `glass-sm / glass / glass-blue`），或用任意值 `shadow-[inset_0_0_18px_rgba(10,200,185,0.18)]`。

3. **仅颜色阴影（如 `shadow-lol-blue/30`）必须配尺寸类**（`shadow-lg` / `shadow-md`），否则只设 `--tw-shadow-color`、不渲染 `box-shadow`。本方案统一用 `shadow-[...]` 任意值或命名 inset key，规避此坑。

4. **`@import` 必须在 `@tailwind` 之前**。引入 Google Fonts 的 `@import url(...)` 要放在 `globals.css` 第一行（`design-system.css` / `animations.css` 的本地 `@import` 之前亦可，所有 `@import` 都先于 `@tailwind`）。

5. **改 `tailwind.config.js` 必须重启 Vite**。HMR 不重载 Tailwind 配置，新增 token 不重启会"看起来没生效"。

6. **`backdrop-blur` 性能**：Electron（Chromium webview）下多层 `backdrop-blur-xl` 叠加可能拖慢滚动。建议——三块面板用 `backdrop-blur-xl`，**内部卡片用 `backdrop-blur-md` 或不 blur**（靠 `bg-white/5` 透明即可），避免嵌套模糊。超大英雄网格区域优先用纯透明色而非 blur。若实测掉帧，把面板 blur 降到 `md` 并用 `bg-white/10` 提高遮盖力。

### 7.3 替换速查（搜索替换友好）

| 现状类名（全局搜索） | 替换为 |
|---------------------|--------|
| `bg-slate-950` | （删除，深空渐变在 body） |
| `bg-slate-900/80` | `bg-white/5 backdrop-blur-md` |
| `bg-slate-900/60` | `bg-white/5 backdrop-blur-md` |
| `bg-slate-900/50` | `bg-white/5 backdrop-blur-xl` |
| `bg-slate-900/30` | `bg-white/[0.03]` |
| `bg-slate-800/80` | `bg-white/[0.04] backdrop-blur-sm` |
| `border-slate-800` | `border-white/10` |
| `border-slate-700` | `border-white/10` |
| `text-slate-100` | `text-ds-fg` |
| `text-slate-400` | `text-ds-fg-muted` |
| `text-slate-500/600` | `text-ds-fg-dim` |
| `hover:bg-slate-800` | `hover:bg-white/10` |

---

## 8. 迁移成本评估

**总评：中偏低（Low-Medium）**

| 维度 | 成本 | 原因 / 可复用资产 |
|------|------|------------------|
| 配色 token | 低 | `lol-blue/red/gold` 全保留，仅新增 `ds-*` 中性令牌；`design-system.css` 的 CSS 变量结构可直接扩展 |
| 背景层 | 中 | 新写 `body` 多层渐变 + 星点（纯 CSS，无依赖）；环境光斑可选 |
| 字体 | 低 | 仅加 3 个 Google Fonts `@import` + `tailwind.config` `fontFamily`；中文走系统回退 |
| 三面板布局 | 低 | 宽度 / flex 结构不动，只换 `bg/border/rounded` 工具类；加 `gap` 与 `p-3` |
| HeroCard | 低 | `getCardStyle` 已是字面量三元结构，替换 `bg/border` 即可，hover 发光改任意值 |
| TeamSlot | 中 | 需把 `border-dashed` + 硬描边改为 `inset` 内发光，逻辑分支（ban/pick/blue/red）保留 |
| 阶段指示器 | 低 | 容器换玻璃，进度条加紫色中段，徽标由纯色块改玻璃 |
| 分析面板 | 低 | 列表项与按钮换玻璃类，语义色（优先级标签）保留 |
| 动效 | 低 | `animate-glow` 降级或替换为静态 `shadow-[...]`；保留 `fade-in/slide-in-up/scale-in`；新增 `prefers-reduced-motion` 兜底 |
| 类型 / 测试 | 零 | 纯视觉改造，不碰 props / context / 逻辑，现有单测全绿无需改动 |
| 风险点 | 中 | `backdrop-blur` 在 Electron 下的性能需实测（见 7.2 #6）；多层玻璃可能影响星点/光斑可见度，需视觉调参 |

**建议分阶段实施**：
1. **P1（1-2h）**：深空背景 + 字体 + 三面板/header/footer 玻璃化（最大视觉收益，最低风险）。
2. **P2（1-2h）**：TeamSlot 内发光 + 阶段指示器徽标玻璃化（核心 BP 视觉）。
3. **P3（0.5-1h）**：HeroCard / 分析卡片 / 按钮统一玻璃语言 + 动效降级 + `prefers-reduced-motion`。
4. **P4（验证）**：在 Electron 实机跑 `pnpm electron:dev`，验证 blur 性能与玻璃层次，按需回退 blur 强度。

**可复用资产清单**：`lol-*` 颜色 token、`animate-glow/glow-blue/red/gold`（降级使用）、`animate-fade-in/slide-in-up/scale-in`、`.btn-game` 高光伪元素、`.hover-scale`、`cn()` 工具、`input-game` 聚焦态——全部保留。
