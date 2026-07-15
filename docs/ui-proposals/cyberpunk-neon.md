# 赛博朋克霓虹强化 · UI 调整方案

> 面向 LoL Ban/Pick 模拟器的视觉风格强化方案。在现有深色游戏化底座上注入霓虹光效、故障艺术（glitch）、扫描线与 HUD 元素，保留 BP 仪式感的同时提升未来感。
>
> **数据来源**：ui-ux-pro-max 技能库命中 `Retro-Futurism` / `Cyberpunk UI` / `Cyberpunk Mobile HUD` 三条风格记录，及 `Quantum Computing Interface` 调色板。配色、字体、效果均基于数据库返回值整合，非凭空构造。

---

## 1. 设计理念

**一句话定位**：把 BP 界面从「召唤师峡谷战术板」升级为「2077 战术终端」——纯黑虚空底 + 霓虹青/品红/紫三色光效 + CRT 扫描线 + 故障切换，让每一次 ban/pick 像在黑客终端里执行指令。

**适合场景**：电子竞技内容创作、赛事直播 OB 工具、玩家战术复盘、追求沉浸感的桌面玩具。强氛围、弱信息密度场景最契合；纯数据看板场景需下调霓虹强度（见 §7 降级策略）。

**与现状差异**：
| 维度 | 现状（游戏化深色） | 赛博朋克霓虹 |
|------|------------------|-------------|
| 底色 | slate-950 蓝灰 | 纯黑 void #0A0A0F |
| 主色 | lol-blue 青绿 / lol-red 玫红 / lol-gold 暖金 | 霓虹青 / 霓虹品红 / 电光紫 |
| 光效 | glow 脉冲（单色 box-shadow） | 霓虹辉光 + 扫描线 + glitch RGB 分裂 |
| 字体 | 系统无衬线 + 局部 mono | Orbitron 标题 + JetBrains Mono 正文 |
| 装饰 | 圆角卡片 + 渐变背景 | 切角（chamfer）+ HUD 角标 + 网格底纹 |
| 动效 | fade/slide/scale + glow-pulse | 上述 + glitch 抖动 + 扫描线扫掠 + 霓虹闪烁 |

**功能不变**：三面板布局、导入导出、分析面板、BP 阶段流程全部保留，仅调整视觉与布局比例。

---

## 2. 配色系统

基于数据库 `Quantum Computing Interface`（#00FFFF / #7B61FF / #FF00FF / #050510）与 `Cyberpunk Mobile HUD`（#0A0A0F / #00FF88 / #FF00FF / #00D4FF）整合。为可读性将纯 #FF00FF 微调为 #FF2D95（品红），保持高对比但不刺眼。

### 2.1 核心色板

| 角色 | Hex | CSS 变量 | 映射现状 |
|------|-----|---------|---------|
| 蓝方主色（霓虹青） | `#00E5FF` | `--neon-cyan` | 替换 `--lol-blue-primary` (#0ac8b9) |
| 蓝方辉光 | `#7DF9FF` | `--neon-cyan-glow` | 替换 `--lol-blue-glow` (#00d4ff) |
| 蓝方暗调 | `#00B8D4` | `--neon-cyan-dark` | 替换 `--lol-blue-dark` (#08a094) |
| 红方主色（霓虹品红） | `#FF2D95` | `--neon-magenta` | 替换 `--lol-red-primary` (#f2385b) |
| 红方辉光 | `#FF6EC7` | `--neon-magenta-glow` | 替换 `--lol-red-glow` (#ff5c7c) |
| 红方暗调 | `#D4186E` | `--neon-magenta-dark` | 替换 `--lol-red-dark` (#c92641) |
| 装饰强调（电光紫） | `#B026FF` | `--neon-violet` | 替换 `--lol-gold` (#c8aa6e) |
| 装饰辉光 | `#D4B5FF` | `--neon-violet-glow` | 替换 `--lol-gold-glow` (#ffd700) |
| 底色·虚空 | `#0A0A0F` | `--bg-void` | 替换 `--bg-primary` (#091428) |
| 底色·深空 | `#12121A` | `--bg-deep` | 替换 `--bg-secondary` (#0a152e) |
| 卡片面 | `#16161F` | `--bg-card` | 替换 `--bg-card` (#010a13) |
| 玻璃面板 | `rgba(18,18,26,0.85)` | `--bg-glass` | 替换 `--bg-glass` |
| 边框·暗 | `#2A2A3A` | `--border-dim` | 替换 `--border-subtle` (#1e293b) |
| 边框·霓虹 | `#3D2A5C` | `--border-neon` | 新增（紫调边框） |
| 文本·主 | `#E0E0FF` | `--text-primary` | 替换 (#e2e8f0)，带微紫 |
| 文本·次 | `#9D9DB8` | `--text-secondary` | 替换 (#94a3b8) |
| 文本·弱 | `#5A5A78` | `--text-muted` | 替换 (#64748b) |
| 警示/破坏 | `#FF3366` | `--neon-danger` | 新增，用于 destructive |

### 2.2 语义映射说明

- **蓝方 → 霓虹青**：保留「蓝方=冷色」语义，但把偏绿的 lol-blue 推到更冷的青，契合 HUD/终端感。
- **红方 → 霓虹品红**：保留「红方=暖色」语义，品红比玫红更「电光」，与青形成最强互补对比。
- **金色 → 电光紫**：金色在纯黑底上偏暖、显旧；紫色是赛博朋克签名色，承担原金色的「装饰/高亮/稀有」语义（如分析面板统计数、清除按钮 hover）。
- **纯黑底**：slate-950 仍带蓝灰，赛博朋克需要更纯粹的虚空黑让霓虹跳出。

### 2.3 对比度自检（WCAG）

- `#E0E0FF` on `#0A0A0F` ≈ 16.8:1（AAA 通过）
- `#00E5FF` on `#0A0A0F` ≈ 11.2:1（AAA 通过，用于大字/标签）
- `#9D9DB8` on `#0A0A0F` ≈ 7.4:1（AAA 通过，正文次要文本）
- `#5A5A78` on `#0A0A0F` ≈ 3.1:1（仅用于装饰/非关键信息，正文不可用）

> 霓虹色作为「背景上的文字」时仍需配 `text-shadow` 辉光以增强可读性，但正文主体保持高对比纯色。

---

## 3. 字体

数据库 `Retro-Futurism` 风格记录推荐 Orbitron + JetBrains Mono，与现有代码局部已用的 `font-mono` 完全兼容。

| 角色 | 字体 | 字重 | 理由 |
|------|------|------|------|
| 标题（app 标题 / 队名 / 阶段标签） | Orbitron | 700 / 900 | 几何切角无衬线，天生带「未来 HUD」感，大字号下识别度高 |
| 正文 / 数据 / 英雄名 / 进度数 | JetBrains Mono | 400 / 500 | 等宽字体强化「终端数据流」质感，现有 `font-mono` 进度计数可直接复用 |
| 中文回退 | 系统无衬线 | 400 / 700 | Orbitron 不含中文，中文走 `"Orbitron", "JetBrains Mono", "Microsoft YaHei", sans-serif` 回退 |

**Google Fonts 链接**：
```
https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Orbitron:wght@700;900&display=swap
```

**CSS 导入**（加到 `src/styles/design-system.css` 顶部，`@layer` 之前，遵循「@import 必须先于 @tailwind」坑）：
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Orbitron:wght@700;900&display=swap');
```

**Tailwind 配置**：
```js
fontFamily: {
  display: ['Orbitron', 'Microsoft YaHei', 'sans-serif'],
  mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  body: ['JetBrains Mono', 'Microsoft YaHei', 'sans-serif'],
}
```

> Electron 桌面应用首次加载需联网拉字体；离线场景可将 woff2 下载到 `src/assets/fonts/` 并改 `@font-face` 本地引用。生产构建建议本地化以保证启动即渲染正确字体。

---

## 4. 布局结构

三面板 + header/footer 框架不变，调整面板宽度、间距与背景层。新增两个全局装饰层：扫描线 overlay 与网格底纹，均 `pointer-events-none`。

### 4.1 ASCII 布局示意

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER  h-16  [◆ BAN/PICK TERMINAL]  ............ [STATUS: ONLINE ●]        │ ← 顶栏 + 状态灯
├────────────────┬──────────────────────────────────────┬─────────────────────┤
│ LEFT  w-80     │ CENTER  flex-1                       │ RIGHT  w-96         │
│ 英雄网格        │ BP 竞技场                             │ 分析面板             │
│                │                                      │                     │
│ ▸ [search___]  │ ┌─ PHASE INDICATOR ─────────────┐   │ ▸ ANALYSIS          │
│ ▸ [TAGS ▼]     │ │ BAN PHASE · STEP 03/20        │   │   [RUN ANALYZE]     │
│                │ │ ▰▰▰░░░░░░░░░░░░░░░ 15%        │   │                     │
│ ┌──┬──┬──┐    │ │ [BLUE TEAM] [BAN HERO]        │   │ ▸ RECOMMENDATIONS   │
│ │  │  │  │    │ └───────────────────────────────┘   │   ┌───────────────┐ │
│ ├──┼──┼──┤    │                                      │   │ rec card      │ │
│ │  │  │  │    │ ┌────────────┐  ┌────────────┐      │   └───────────────┘ │
│ ├──┼──┼──┤    │ │  BLUE SIDE │  │  RED SIDE  │      │   ┌───────────────┐ │
│ │  │  │  │    │ │ ◢ BANS ◣   │  │ ◢ BANS ◣   │      │   │ rec card      │ │
│ └──┴──┴──┘    │ │ □□□□□      │  │ □□□□□      │      │   └───────────────┘ │
│                │ │ ◢ PICKS ◣  │  │ ◢ PICKS ◣  │      │                     │
│ ▒ 64 items     │ │ □□□□□      │  │ □□□□□      │      │ ▸ QUICK STATS       │
│                │ └────────────┘  └────────────┘      │   synergy   78      │
│                │                                      │   matchup  52:48   │
├────────────────┴──────────────────────────────────────┴─────────────────────┤
│ FOOTER  h-16  [UNDO] [RESET]              [EXPORT] [IMPORT]                 │
└──────────────────────────────────────────────────────────────────────────────┘
        ▒▒▒ 全局扫描线 overlay（pointer-events-none，覆盖整窗）▒▒▒
        ░░░ 网格底纹（fixed，最底层，opacity 0.04）░░░
```

### 4.2 布局调整要点

| 区域 | 现状 | 调整 | 说明 |
|------|------|------|------|
| 全局根 | `bg-slate-950` | `bg-[#0A0A0F]` + 网格底纹 + 扫描线层 | 三层叠加：底色 → 网格 → 扫描线 |
| Header | `h-16 border-slate-800 bg-slate-900/50` | `h-16 border-b border-[#2A2A3A] bg-[#12121A]/70 backdrop-blur` | 加 backdrop-blur 透出网格 |
| 左面板 | `w-80 border-r bg-slate-900/30 p-4` | `w-80 border-r border-[#2A2A3A] bg-[#0A0A0F]/60 p-4` | 更纯的黑让头像更跳 |
| 中面板 | `flex-1 p-6` | `flex-1 p-6`（不变） | 仅内部卡片改色 |
| 右面板 | `w-96 border-l bg-slate-900/30 p-4` | `w-96 border-l border-[#2A2A3A] bg-[#0A0A0F]/60 p-4` | 同左 |
| Footer | `h-16 border-t bg-slate-900/50` | `h-16 border-t border-[#2A2A3A] bg-[#12121A]/70 backdrop-blur` | 同 header |

### 4.3 全局装饰层（新增）

```tsx
{/* 根容器内，最外层 div 内部首个元素 */}
{/* 网格底纹 */}
<div className="pointer-events-none fixed inset-0 z-0"
     style={{
       backgroundImage: 'linear-gradient(rgba(176,38,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(176,38,255,0.04) 1px, transparent 1px)',
       backgroundSize: '32px 32px',
     }} />
{/* 扫描线 overlay */}
<div className="pointer-events-none fixed inset-0 z-50 scanlines" />
```

扫描线用 CSS 类（`src/styles/animations.css`）：
```css
.scanlines::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0) 0px,
    rgba(0, 0, 0, 0) 2px,
    rgba(0, 0, 0, 0.15) 3px,
    rgba(0, 0, 0, 0) 4px
  );
  animation: scan-sweep 8s linear infinite;
}
@keyframes scan-sweep {
  0% { background-position: 0 0; }
  100% { background-position: 0 100vh; }
}
```

---

## 5. 关键组件视觉

### 5.1 英雄卡片 HeroCard

**视觉描述**：方形卡片，切角顶边（chamfer），纯黑卡面，英雄头像居中。默认态：暗紫边框 + 微弱内发光。可交互 ban 态：品红霓虹边框 + 扫描线掠过 + 右上角 BAN 标签 glitch 闪烁。可交互 pick 态：青色霓虹边框 + 同上。禁用态：灰度 + 降透明度 + 划线感。hover 时边框辉光增强 + 轻微上浮。

**关键 Tailwind 类名**（替换 `HeroCard.tsx` 的 `getCardStyle`）：
```tsx
// ban 可交互态
'cursor-pointer bg-[#16161F] border-2 border-neon-magenta/40 hover:border-neon-magenta/70',
'hover:shadow-magenta hover:shadow-lg',          // 注意：shadow-magenta 是颜色染色，必须配 shadow-lg 才出光
'hover:scale-105 active:scale-100',
'transition-all duration-150 ease-out',
'animate-fade-in chamfer-top'                     // chamfer-top 为自定义组件类

// pick 可交互态
'cursor-pointer bg-[#16161F] border-2 border-neon-cyan/40 hover:border-neon-cyan/70',
'hover:shadow-cyan hover:shadow-lg',
'hover:scale-105 active:scale-100',
'transition-all duration-150 ease-out',
'animate-fade-in chamfer-top'
```

**BAN/PICK 标签**（替换 `getActionBadge`）：
```tsx
isBan
  ? 'bg-neon-magenta border-neon-magenta/50 glow-magenta text-[#0A0A0F]'
  : 'bg-neon-cyan border-neon-cyan/50 glow-cyan text-[#0A0A0F]',
'animate-glitch'   // 替换 animate-glow，glitch 抖动 + RGB 分裂
```

> 注意：`text-[#0A0A0F]` 深字配霓虹底，对比度远高于白字配霓虹底。

### 5.2 BP TeamSlot

**视觉描述**：方形槽位，空槽为虚线切角框 + 暗序号；已填槽显示头像 + 英雄名。蓝方 pick 槽带青色 HUD 角标（四角 L 形装饰），红方 pick 槽带品红 HUD 角标。ban 槽统一暗化（灰紫边框），与 pick 槽拉开层级。已填 pick 槽内部叠一层扫描线增强「全息投影」感。

**关键类名**：
```tsx
// 空 pick 槽（蓝方）
'aspect-square rounded flex flex-col items-center justify-center transition-all duration-300',
'border-2 border-dashed border-neon-cyan/30 bg-[#0A0A0F]/50',
'shadow-cyan-sm hud-corners-cyan'    // hud-corners-* 为自定义组件类，用伪元素画四角

// 已填 pick 槽（蓝方）
'aspect-square rounded flex flex-col items-center justify-center overflow-hidden',
'bg-[#16161F] border-2 border-neon-cyan/40 shadow-cyan-sm',
'scanlines-inner hud-corners-cyan'   // 内部扫描线 + 角标

// ban 槽（已填，双方统一暗调）
'bg-[#12121A]/80 border border-[#2A2A3A]'
```

**HUD 角标 CSS**（`animations.css`）：
```css
.hud-corners-cyan { position: relative; }
.hud-corners-cyan::before,
.hud-corners-cyan::after {
  content: '';
  position: absolute;
  width: 10px; height: 10px;
  border-color: var(--neon-cyan);
  pointer-events: none;
}
.hud-corners-cyan::before {
  top: 2px; left: 2px;
  border-top: 2px solid; border-left: 2px solid;
}
.hud-corners-cyan::after {
  bottom: 2px; right: 2px;
  border-bottom: 2px solid; border-right: 2px solid;
}
```

### 5.3 阶段指示器

**视觉描述**：终端风格横条，左侧阶段名（Orbitron 大写），中间进度条（霓虹填充 + 扫光），右侧「03/20」等宽计数。当前方队标签为实心霓虹色块带 glitch 抖动，动作文字旁带闪烁光标 `▌`。完成态显示绿色 `● ONLINE` 脉冲。

**关键类名**：
```tsx
// 容器
'mb-6 rounded-lg bg-gradient-to-r from-[#12121A]/80 to-[#0A0A0F]/80',
'p-4 border border-[#3D2A5C]/50 backdrop-blur-sm'

// 进度条轨道
'h-1.5 w-24 rounded-full bg-[#0A0A0F] overflow-hidden border border-[#2A2A3A]'

// 进度条填充
'h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-cyan-glow',
'transition-all duration-300 progress-scan'   // progress-scan 叠扫光动画

// 当前方队标签（蓝方）
'relative rounded px-4 py-2 text-sm font-bold font-display uppercase tracking-wider',
'bg-neon-cyan text-[#0A0A0F] shadow-cyan animate-glitch'
```

### 5.4 分析卡片

**视觉描述**：全息面板感，推荐列表每项为切角卡片，hover 时边框转紫并上浮。优先级标签用霓虹色描边胶囊（高=品红 / 中=紫 / 低=青）。胜率条改为霓虹渐变 + 内部扫光。统计区数字用 Orbitron 大字号 + 辉光。

**关键类名**：
```tsx
// 推荐卡片
'rounded p-3 border transition-all duration-150 hover-scale cursor-pointer',
'bg-[#16161F]/60 border-[#2A2A3A] hover:border-neon-violet/60',
'hover:shadow-violet hover:shadow-md animate-slide-in-up chamfer-top'

// 优先级标签
rec.priority === 'high'
  ? 'bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40'
  : rec.priority === 'medium'
  ? 'bg-neon-violet/20 text-neon-violet border border-neon-violet/40'
  : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'

// 胜率条
'h-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-cyan-glow progress-scan'
```

---

## 6. 交互与动效

遵循数据库 UX 规则：动画时长 150–300ms，传达意义而非纯装饰，必须尊重 `prefers-reduced-motion`。

### 6.1 动效清单

| 交互 | 触发 | 时长 | 缓动 | 实现 |
|------|------|------|------|------|
| 卡片 hover 上浮+辉光 | mouseenter | 150ms | ease-out | `transition-all duration-150 hover:scale-105` |
| ban/pick 确认 glitch | 阶段切换瞬间 | 300ms | steps(2) | `animate-glitch`（skew + RGB 分裂） |
| 阶段标签 glitch 抖动 | 当前方标签常驻 | 2s loop | ease-in-out | `animate-glitch` 弱化版，幅度 ±1px |
| 扫描线扫掠 | 全局常驻 | 8s loop | linear | `scan-sweep` keyframe |
| 进度条扫光 | 进度变化 | 300ms | ease-out | `progress-scan` 叠加层 |
| glow 脉冲 | 当前方队指示灯 | 2s loop | ease-in-out | 复用现有 `animate-glow`，换 `--glow-color` |
| 列表项入场 | 数据加载后 | 300ms | ease-out | 复用 `animate-slide-in-up` + stagger delay |
| 按钮 press 缩放 | active | 100ms | ease-out | `active:scale-95`（复用现有 btn-game） |
| 完成态脉冲 | BP 结束 | 2s loop | ease-in-out | `animate-pulse` + 绿色辉光 |

### 6.2 glitch 关键帧

```css
@keyframes glitch {
  0%, 100% {
    transform: translate(0);
    text-shadow: 0 0 8px var(--glow-color, currentColor);
  }
  20% {
    transform: translate(-1px, 1px);
    text-shadow: -2px 0 #FF2D95, 2px 0 #00E5FF;   /* RGB 分裂 */
  }
  40% {
    transform: translate(1px, -1px);
    text-shadow: 2px 0 #FF2D95, -2px 0 #00E5FF;
  }
  60% {
    transform: translate(-1px, 0);
    text-shadow: 0 0 8px var(--glow-color, currentColor);
  }
}
.animate-glitch {
  animation: glitch 2s ease-in-out infinite;
}
/* 一次性强 glitch（阶段切换用） */
.animate-glitch-once {
  animation: glitch 300ms steps(2) 1;
}
```

### 6.3 prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .animate-glitch,
  .animate-glitch-once,
  .scanlines::before,
  .progress-scan::after,
  .animate-glow::after {
    animation: none !important;
  }
  /* 保留 fade-in/slide-in 的最终态，禁用过程 */
  .animate-fade-in,
  .animate-slide-in-up,
  .animate-scale-in {
    animation-duration: 1ms !important;
  }
}
```

> 数据库 `Cyberpunk Mobile HUD` 明确标注「Requires careful reduced-motion handling」——glitch/扫描线/flicker 必须可关，否则前庭敏感用户不适。

---

## 7. Tailwind 实现要点

### 7.1 自定义 token（追加到 `tailwind.config.js`）

```js
extend: {
  colors: {
    // 赛博朋克霓虹（与现有 lol-* 并存，迁移完成后可删 lol-*）
    'neon-cyan': '#00E5FF',
    'neon-cyan-glow': '#7DF9FF',
    'neon-cyan-dark': '#00B8D4',
    'neon-magenta': '#FF2D95',
    'neon-magenta-glow': '#FF6EC7',
    'neon-magenta-dark': '#D4186E',
    'neon-violet': '#B026FF',
    'neon-violet-glow': '#D4B5FF',
    'void': '#0A0A0F',
    'void-deep': '#12121A',
    'void-card': '#16161F',
    'border-dim': '#2A2A3A',
    'border-neon': '#3D2A5C',
    'neon-danger': '#FF3366',
  },
  boxShadow: {
    // 严格遵循现有模式：每档单独 key，不支持 /N 透明度修饰符
    'cyan-sm': '0 0 12px rgba(0, 229, 255, 0.15)',
    'cyan': '0 0 20px rgba(0, 229, 255, 0.4)',
    'cyan-lg': '0 0 30px rgba(0, 229, 255, 0.5)',
    'magenta-sm': '0 0 12px rgba(255, 45, 149, 0.15)',
    'magenta': '0 0 20px rgba(255, 45, 149, 0.4)',
    'magenta-lg': '0 0 30px rgba(255, 45, 149, 0.5)',
    'violet-sm': '0 0 12px rgba(176, 38, 255, 0.15)',
    'violet': '0 0 20px rgba(176, 38, 255, 0.35)',
    'violet-lg': '0 0 30px rgba(176, 38, 255, 0.45)',
  },
  animation: {
    'fade-in': 'fade-in 0.3s ease-out',
    'slide-in-up': 'slide-in-up 0.3s ease-out',
    'scale-in': 'scale-in 0.2s ease-out',
    'glitch': 'glitch 2s ease-in-out infinite',
    'glitch-once': 'glitch 300ms steps(2) 1',
    'scan-sweep': 'scan-sweep 8s linear infinite',
  },
  keyframes: {
    /* 现有 fade-in / slide-in-up / scale-in 保留 */
    'glitch': { /* 见 §6.2 */ },
    'scan-sweep': { '0%': { backgroundPosition: '0 0' }, '100%': { backgroundPosition: '0 100vh' } },
  },
  fontFamily: {
    display: ['Orbitron', 'Microsoft YaHei', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    body: ['JetBrains Mono', 'Microsoft YaHei', 'sans-serif'],
  },
}
```

### 7.2 三个必避的坑（来自 CLAUDE.md）

1. **类名必须完整字面量，禁 `${}` 插值**。ban/pick 分支用字面量三元：
   ```tsx
   // 正确
   isBan ? 'border-neon-magenta/40 hover:shadow-magenta' : 'border-neon-cyan/40 hover:shadow-cyan'
   // 错误（JIT 不生成）
   `border-neon-${color}/40`
   ```

2. **自定义 boxShadow 档位不支持 `/N` 透明度修饰符**。`shadow-cyan/40` 会被误解析为颜色染色、丢弃命名 key。必须用 `cyan-sm` / `cyan` / `cyan-lg` 三档独立 key，且颜色染色需配尺寸类：
   ```tsx
   // 正确：颜色档位 + 尺寸类
   'hover:shadow-cyan hover:shadow-lg'
   // 错误：仅颜色染色不出光
   'hover:shadow-cyan'
   ```

3. **改 `tailwind.config.js` 必须重启 Vite**。HMR 不重载 Tailwind 配置，调 token 时改完不重启会以为「没生效」。

### 7.3 自定义组件类（`src/styles/animations.css` 追加）

```css
/* 切角顶边 */
.chamfer-top {
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
}
/* HUD 四角（蓝/红/紫三色变体，见 §5.2，此处省略 violet 变体） */
.hud-corners-cyan { /* ... */ }
.hud-corners-magenta { /* ...，border-color: var(--neon-magenta) */ }
/* 内部扫描线（用于已填槽位） */
.scanlines-inner { position: relative; }
.scanlines-inner::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.2) 3px, transparent 4px);
}
/* 进度条扫光 */
.progress-scan { position: relative; overflow: hidden; }
.progress-scan::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: progress-shimmer 2s linear infinite;
}
@keyframes progress-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
/* glow 队伍色映射更新 */
.glow-cyan { --glow-color: rgba(0, 229, 255, 0.9); }
.glow-magenta { --glow-color: rgba(255, 45, 149, 0.9); }
.glow-violet { --glow-color: rgba(176, 38, 255, 0.9); }
```

### 7.4 迁移策略：双色并存

建议 `neon-*` token 与现有 `lol-*` token 并存于 `tailwind.config.js`，按组件逐个替换类名，最后一次性删除 `lol-*`。这样可分 PR 推进、随时回退，避免大爆炸式改动。

---

## 8. 迁移成本评估

**总成本：中**

### 8.1 成本拆解

| 模块 | 工作量 | 原因 |
|------|--------|------|
| 配色 token | 低 | `design-system.css` + `tailwind.config.js` 集中定义，机械替换 |
| 字体 | 低 | 一处 `@import` + `fontFamily` 配置 + 组件按需加 `font-display` / `font-mono` |
| 全局装饰层 | 低 | 新增两个 fixed div + 两段 CSS，不动业务逻辑 |
| 组件类名替换 | 中 | 5 个组件 × 多状态分支，每处需手写字面量三元（禁插值） |
| 新增动效/组件类 | 中 | glitch/scanline/hud-corners/chamfer 四组 CSS，需调 reduced-motion |
| 阴影档位 | 低 | 复制现有 blue/red/gold 三档模式，改色值即可 |
| 测试 | 低 | 视觉改动不触碰逻辑，现有单测全绿；仅需人工回归视觉 |

### 8.2 可复用资产

- **glow 脉冲机制**：`animate-glow::after` + `--glow-color` 架构完全复用，仅新增 `.glow-cyan/-magenta/-violet` 三个色值类。
- **boxShadow 三档模式**：`blue-sm/blue/blue-lg` 结构照搬，新增 `cyan-sm/cyan/cyan-lg` 等九个 key。
- **fade-in / slide-in-up / scale-in**：动效不变，直接复用。
- **btn-game / input-game 组件类**：结构不变，换 `--border-default` / `--lol-blue-primary` 引用即可。
- **`cn()` 工具 + 字面量三元模式**：现有代码已严格遵循「禁插值」规范，新色名照此模式接入即可。

### 8.3 风险点

1. **字体离线**：Electron 生产包若不内嵌 woff2，断网时回退系统字体，标题失去 HUD 感。建议构建时本地化。
2. **霓虹疲劳**：扫描线 + glitch + glow 同时常驻可能让长时间使用者眼疲劳。建议扫描线 opacity 控制在 0.15 以内，glitch 幅度 ±1px，并提供「降低强度」开关（可存 localStorage）。
3. **切角 clip-path**：`clip-path` 会裁掉 `box-shadow` 外发光。需 HUD 角标或外层 wrapper 承载辉光，不能直接给 chamfer 元素加 `shadow-*`。这是本方案最易踩的实现坑。
4. **`/N` 透明度**：`border-neon-cyan/40` 这类标准颜色透明度修饰符**可用**（与自定义 boxShadow 的 `/N` 坑无关），放心使用。

---

## 附：落地顺序建议

1. `tailwind.config.js` + `design-system.css` 加 `neon-*` token、字体、boxShadow、keyframes（不删 `lol-*`）
2. `animations.css` 加 scanlines / glitch / hud-corners / chamfer / glow-cyan 等组件类
3. `App.tsx` 根容器加网格底纹 + 扫描线 overlay，header/footer 换色
4. `BanPickArena.tsx` 阶段指示器 + TeamSlot 换霓虹类
5. `HeroCard.tsx` + `HeroGrid.tsx` 换霓虹类
6. `AnalysisPanel.tsx` 换霓虹类
7. 全局验证 `pnpm tsc --noEmit` + `pnpm lint` + `pnpm test`
8. 人工视觉回归，删除 `lol-*` token，提交
