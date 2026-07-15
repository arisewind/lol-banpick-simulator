# 客户端仪式复刻 UI 方案

> 风格方向：贴近英雄联盟客户端真实 BP 界面的仪式感——金色装饰边框、阶段切换的戏剧性登场动画、克制而沉郁的队伍色，让每次 Ban/Pick 像看一场赛事直播。

---

## 1. 设计理念

**一句话定位**：把 BP 从"工具型配色对比器"升级为"赛事直播级仪式舞台"——金 + 深蓝 + 黑的主调统领全局，队伍色退居二线只作阵营暗示，每一次阶段切换都伴随聚光灯与登场高光。

**适合场景**：单机/演示型 BP 模拟、赛事解说复盘、视频录制素材。强调"回合庄重感"与"过程观赏性"，而非快速操作效率。

**与现状差异**：
| 维度 | 现状 | 本方案 |
|------|------|--------|
| 主色 | 蓝/红对撞为主，金为点缀 | **金主导**，蓝红降饱和作阵营暗示 |
| 阶段切换 | 文字 pill + 进度条 | 戏剧性登场：聚光灯扫光 + 阶段名衬线大字浮现 |
| 队伍色 | 高饱和（#0ac8b9 / #f2385b） | 克制冷青/暗红（#0a8c9c / #b6253f） |
| 装饰 | 发光阴影 + glow 脉冲 | 金色角饰边框 + 金线分割 + 保留 glow 脉冲 |
| 字体 | Tailwind 默认无衬线 | 标题衬线庄重（Cinzel）+ 正文电竞几何（Chakra Petch） |
| 底色 | slate-950 中性黑 | #010a13 极黑 + #091428 深蓝层次 |

功能不变：三面板布局、导入/导出、分析面板全部保留，仅调整视觉与布局密度。

---

## 2. 配色系统

以现有 `lol-gold` (#c8aa6e) 为核心扩展出"仪式金"三档（暗边/正/亮高光），队伍色降饱和、压暗，底色用现有 `lol-darker` / `lol-dark` 加深层次。

| 角色 | Hex | CSS 变量 | 映射/替换说明 |
|------|-----|----------|---------------|
| 仪式金（主装饰） | `#c8aa6e` | `--ceremony-gold` | 沿用现有 `lol-gold`，作为边框/分割线/图标主色 |
| 亮金高光 | `#f0e6d2` | `--ceremony-gold-bright` | 新增。扫光、活跃态、标题描边高光 |
| 暗金边框 | `#785a28` | `--ceremony-gold-dark` | 新增。静止态金边、凹陷分隔，与亮金形成浮雕 |
| 极黑底 | `#010a13` | `--ceremony-void` | 沿用 `lol-darker`，全局最底层背景 |
| 深蓝层 | `#091428` | `--ceremony-navy` | 沿用 `lol-dark`，面板/卡片第二层 |
| 卡片表面 | `#0a1428` | `--ceremony-surface` | 新增（比 navy 略亮），槽位/卡片底 |
| 蓝方（冷青克制） | `#0a8c9c` | `--ceremony-blue` | 替换 `lol-blue`(#0ac8b9) → 降饱和压暗，更"深海冷青" |
| 蓝方高光 | `#1ec6d4` | `--ceremony-blue-glow` | 替换 `lol-blue-glow`(#00d4ff)，活跃态/glow 颜色 |
| 红方（暗红克制） | `#b6253f` | `--ceremony-red` | 替换 `lol-red`(#f2385b) → 降明度，更"暗血红" |
| 红方高光 | `#e0425a` | `--ceremony-red-glow` | 替换 `lol-red-glow`(#ff5c7c) |
| 文字主 | `#f0e6d2` | `--ceremony-text` | 亮金白，比 slate-100 更暖更"奖杯" |
| 文字次 | `#a09b8c` | `--ceremony-text-muted` | 暖灰，比 slate-400 更贴合金调 |
| 分割线 | `#1e2d4a` | `--ceremony-divider` | 深蓝金线，替换 slate-800 |

**队伍色克制原则**：蓝红不再用作大色块填充（现状 `bg-lol-blue`/`bg-lol-red` 的 pill），改为**金为主 + 队伍色仅用于细边框/小圆点/文字色**。整屏 70% 金/黑/深蓝，20% 队伍色，10% 高光。

---

## 3. 字体

| 角色 | 字体 | 理由 |
|------|------|------|
| 大标题（阶段名 / 队名 / 界面标题） | **Cinzel**（衬线 display） | 罗马式刻字衬线，自带"加冕/仪式"气质，贴近 LoL 客户端 Beaufort for LoL 的衬线庄重感，Google Fonts 免费 |
| 次级标题 / 数据 / 正文 | **Chakra Petch**（几何无衬线） | 电竞几何骨架，数据与正文清晰，承接 ui-ux-pro-max 推荐的 gaming mood，与 Cinzel 一庄重一利落形成张力 |

**Google Fonts 链接**：
```
https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Cinzel:wght@500;600;700;800&display=swap
```

**CSS 引入**（写入 `src/styles/design-system.css` 顶部，须在 `@tailwind` 之前——见 globals.css 现有 `@import` 顺序约定）：
```css
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=Cinzel:wght@500;600;700;800&display=swap');
```

**Tailwind 映射**（`tailwind.config.js` → `theme.extend.fontFamily`）：
```js
fontFamily: {
  serif: ['Cinzel', 'serif'],
  display: ['Chakra Petch', 'sans-serif'],
  // body 默认改用 display
}
```
用法：阶段名 `font-serif font-bold tracking-wider`，正文/数据 `font-display`。

---

## 4. 布局结构

强化仪式感的三个布局调整：① header 变窄并加金色横向页眉线 + 中央"回合徽记"；② 三面板之间用金色竖向分割线；③ footer 变为"操控台"风格，按钮改为金色描边而非填色。

**整体变窄**：左面板从 `w-80` 收为 `w-72`（给中央竞技场更多戏剧空间），右面板从 `w-96` 收为 `w-80`，中央 `flex-1` 得到放大。

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ════════════════════ 金色页眉横线 ════════════════════                    │  header (h-14)
│   BAN / PICK  SIMULATOR      ◆ ROUND 03 / 20 ◆        状态: 蓝方禁用       │
│  ════════════════════════════════════════════════════                     │
├───────────────┬──────────────────────────────────┬───────────────────────┤
│  英雄池        │  ┌── 阶段指示器（戏剧性）──────┐  │  分析面板             │
│  ┌───────────┐│  │  BAN PHASE  (Cinzel 大字)   │  │  推荐列表             │
│  │ 搜索框     ││  │  ▓▓▓▓▓░░░░░  进度金条      │  │  ┌────────┐          │
│  └───────────┘│  └─────────────────────────────┘  │  │ 推荐卡  │          │
│  标签筛选      │                                    │  └────────┘          │
│  ┌─┬─┬─┬─┬─┐  │  ┌─蓝方(冷青金边)──┐ ┌红方(暗红)─┐│  协同度 / 对阵        │
│  │ │ │ │ │ │  │  │ ◆ BLUE  Bans ●●○○○│ │ ◆ RED  ●●○○○││  ┌────────┐          │
│  ├─┼─┼─┼─┼─┤  │  │        Picks □□□□□│ │        □□□□□││  │ 数据卡  │          │
│  │ │ │ │ │ │  │  └──────────────────┘ └──────────┘│  └────────┘          │
│  │ 英雄网格    │   (登场动画: 当前回合槽位聚光)       │                      │
│  │ 3列头像     │                                    │                      │
│  └───────────┘│                                    │                      │
├───────────────┴──────────────────────────────────┴───────────────────────┤
│  ════════════════════ 金色页脚横线 ════════════════════                    │  footer (h-12)
│   [ Undo ]  [ Reset ]              [ Export ]  [ Import ]                 │
└──────────────────────────────────────────────────────────────────────────┘
        金色竖向分割线                           金色竖向分割线
```

**分割线实现**：面板间用 `border-r border-lol-gold/20`，header/footer 用 `border-y border-lol-gold-dark/40` 双线（外暗内亮形成浮雕）。中央竞技场外层包一层金色角饰（伪元素四角 `::before/::after` 画 L 形金线）。

---

## 5. 关键组件视觉

### 5.1 英雄卡片（HeroCard）

现状：`bg-slate-900/80 border-2 border-lol-blue/40 hover:shadow-blue`。
调整：底色换 `ceremony-surface`，边框默认暗金，hover 时升亮金 + 金色发光；ban/pick 阵营色仅作 hover 时的细边暗示。

```tsx
// 可交互态（替换 getCardStyle 的 accent 分支）
const accent = actionType === 'ban'
  ? 'border-ceremony-gold-dark/60 hover:border-ceremony-red hover:shadow-red-sm'
  : 'border-ceremony-gold-dark/60 hover:border-ceremony-blue hover:shadow-blue-sm'

// 卡片主体（替换 bg-slate-900/80）
'cursor-pointer bg-ceremony-surface/80 border-2',
'transition-all duration-200 ease-out',
'hover:scale-105 active:scale-100',
'hover:shadow-gold hover:shadow-gold/30',  // 金色主发光
accent,
'animate-fade-in'
```
**注意**：`hover:shadow-gold/30` 这类颜色染色必须配合尺寸类（此处 `hover:shadow-gold` 即自定义档位 key），否则不发光——见第 7 节坑。头像加 `drop-shadow-[0_0_8px_rgba(200,170,110,0.4)]` 金色光晕。

### 5.2 BP TeamSlot（登场感）

现状：方框 + 小头像 + 名字。
调整：**当前回合槽位**获得"聚光灯登场"——金边脉动 + 头像放大 + 名字用 Cinzel；已锁定槽位显示金角饰框；空槽位用暗金虚线 + 阵营色极淡描边。

```tsx
// 当前回合槽位（新增 isCurrentPhase 判定）
'relative aspect-square rounded border-2 border-ceremony-gold-bright',
'bg-ceremony-navy/90 shadow-gold animate-glow glow-gold',
'scale-105 z-10'
// 头像放大
<img className="h-16 w-16 object-contain drop-shadow-[0_0_10px_rgba(240,230,210,0.5)]" />
// 名字用衬线
<span className="mt-1 font-serif text-xs text-ceremony-gold-bright truncate" />

// 已锁定槽位（pick）
'bg-ceremony-surface/60 border-2',
isBlue ? 'border-ceremony-blue/40' : 'border-ceremony-red/40'
// 四角金饰通过 ::before/::after 伪元素（见 design-system.css 新增 .slot-ceremony）

// 空槽位
'border-2 border-dashed border-ceremony-gold-dark/30 bg-ceremony-void/50'
```

### 5.3 阶段指示器（戏剧性）

现状：小 pill + 进度条。
调整：阶段名用 Cinzel 大写大字 + 字间距，进度条改金色阶梯，切换时整块扫光；当前阵营用"徽记"式金色描边块而非纯色填充。

```tsx
// 容器（替换 from-slate-900/80）
'rounded-lg bg-gradient-to-r from-ceremony-navy/90 to-ceremony-void/90',
'p-5 border border-ceremony-gold-dark/40 backdrop-blur-sm',
'relative overflow-hidden'
// 扫光伪元素 .phase-spotlight（见第 6 节动效）

// 阶段名大字
<span className="font-serif text-2xl font-bold tracking-[0.2em] text-ceremony-gold-bright uppercase">
  {t('bp.banPhase')}
</span>

// 进度条金色阶梯
<div className="h-1.5 w-32 rounded-full bg-ceremony-void overflow-hidden border border-ceremony-gold-dark/40">
  <div className="h-full bg-gradient-to-r from-ceremony-gold-dark via-ceremony-gold to-ceremony-gold-bright transition-all duration-300" />
</div>

// 阵营徽记（替换 bg-lol-blue 填充 pill）
'relative rounded border-2 px-4 py-2 font-serif text-sm font-bold tracking-wider',
phase.side === 'blue'
  ? 'border-ceremony-blue text-ceremony-blue-glow bg-ceremony-blue/10 glow-blue'
  : 'border-ceremony-red text-ceremony-red-glow bg-ceremony-red/10 glow-red'
```

### 5.4 分析卡片（AnalysisPanel）

现状：`bg-slate-900/60 border-slate-700`。
调整：卡片换金边层级——主推荐卡用亮金细边，次级用暗金；优先级标签改金系徽章；数据数字用 Chakra Petch 等宽金色。

```tsx
// 推荐卡（替换 bg-slate-900/60 border-slate-700/50）
'rounded p-3 border transition-all duration-200',
'bg-ceremony-surface/60 border-ceremony-gold-dark/40 hover:border-ceremony-gold-bright',
'hover-scale cursor-pointer animate-slide-in-up'

// 优先级标签改金系
rec.priority === 'high'
  ? 'bg-ceremony-red/15 text-ceremony-red-glow border border-ceremony-red/40'
  : rec.priority === 'medium'
  ? 'bg-ceremony-gold/15 text-ceremony-gold-bright border border-ceremony-gold/40'
  : 'bg-ceremony-blue/15 text-ceremony-blue-glow border border-ceremony-blue/40'

// 数据数字
<span className="font-display text-ceremony-gold font-mono" />

// 分析按钮（替换 bg-lol-blue 主按钮为金色主按钮）
'bg-gradient-to-b from-ceremony-gold to-ceremony-gold-dark text-ceremony-void',
'hover:from-ceremony-gold-bright hover:to-ceremony-gold',
'shadow-gold hover:shadow-gold-lg',
```

---

## 6. 交互与动效

所有动效时长 **200–400ms**，曲线沿用 `--ease-out: cubic-bezier(0.33, 1, 0.68, 1)`。

| 触发点 | 动效 | 实现 | 时长 |
|--------|------|------|------|
| 阶段切换 | 聚光灯扫光从左掠过指示器 | `.phase-spotlight::after` 线性渐变 `translateX(-100% → 100%)` | 400ms |
| 英雄登场（pick 锁定） | 头像放大 + 金光脉冲 + 名字上浮 | `scale-in` + `animate-glow glow-gold` + 名字 `slide-in-up` | 300ms |
| 当前回合槽位 | 金边持续脉冲 | 复用现有 `animate-glow glow-gold` | 2s 循环 |
| 卡片 hover | 金边升亮 + 轻微上浮 | `hover:border-ceremony-gold-bright hover:scale-105` | 200ms |
| 进度条推进 | 金色阶梯填充 | `transition-all duration-300` 现有实现保留 | 300ms |
| 阵营徽记呼吸 | glow 脉冲 | 复用现有 `glow-blue`/`glow-red`（颜色已换克制值） | 2s 循环 |

**新增 CSS**（`src/styles/animations.css` 追加）：
```css
/* 阶段切换聚光灯扫光 */
.phase-spotlight::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg,
    transparent 30%,
    rgba(240, 230, 210, 0.12) 50%,
    transparent 70%);
  transform: translateX(-120%);
  pointer-events: none;
}
.phase-spotlight.is-active::after {
  animation: spotlight-sweep 400ms var(--ease-out);
}
@keyframes spotlight-sweep {
  to { transform: translateX(120%); }
}

/* TeamSlot 金色四角饰 */
.slot-ceremony::before,
.slot-ceremony::after {
  content: '';
  position: absolute;
  width: 10px; height: 10px;
  border-color: var(--ceremony-gold-bright);
  border-style: solid;
  pointer-events: none;
}
.slot-ceremony::before { top: 2px; left: 2px; border-width: 2px 0 0 2px; }
.slot-ceremony::after  { bottom: 2px; right: 2px; border-width: 0 2px 2px 0; }
```

**无障碍**：所有动效用 `@media (prefers-reduced-motion: reduce)` 降级——
```css
@media (prefers-reduced-motion: reduce) {
  .phase-spotlight.is-active::after,
  .animate-glow::after { animation: none !important; }
  .hover-scale:hover { transform: none !important; }
}
```
阶段切换在降级模式下仅靠文字与边框颜色变化传达，不依赖运动。

---

## 7. Tailwind 实现要点

### 7.1 新增 / 修改 token（`tailwind.config.js`）

```js
colors: {
  // 仪式金三档（lol-gold 保留作别名指向 ceremony-gold）
  'ceremony-gold': '#c8aa6e',
  'ceremony-gold-bright': '#f0e6d2',
  'ceremony-gold-dark': '#785a28',
  // 底色
  'ceremony-void': '#010a13',
  'ceremony-navy': '#091428',
  'ceremony-surface': '#0a1428',
  'ceremony-divider': '#1e2d4a',
  // 克制队伍色
  'ceremony-blue': '#0a8c9c',
  'ceremony-blue-glow': '#1ec6d4',
  'ceremony-red': '#b6253f',
  'ceremony-red-glow': '#e0425a',
  // 文字
  'ceremony-text': '#f0e6d2',
  'ceremony-text-muted': '#a09b8c',
},
fontFamily: {
  serif: ['Cinzel', 'serif'],
  display: ['Chakra Petch', 'sans-serif'],
},
boxShadow: {
  // 金色三档（新增；blue/red 档位颜色值同步替换为 ceremony 克制色）
  'gold-sm': '0 0 12px rgba(200, 170, 110, 0.2)',
  'gold':    '0 0 20px rgba(200, 170, 110, 0.35)',
  'gold-lg': '0 0 32px rgba(240, 230, 210, 0.5)',
  // blue/red 档位 key 名保留，仅替换 rgba 值为克制色
  'blue-sm': '0 0 12px rgba(10, 140, 156, 0.15)',
  'blue':    '0 0 20px rgba(10, 140, 156, 0.4)',
  'blue-lg': '0 0 30px rgba(30, 198, 212, 0.5)',
  'red-sm':  '0 0 12px rgba(182, 37, 63, 0.15)',
  'red':     '0 0 20px rgba(182, 37, 63, 0.4)',
  'red-lg':  '0 0 30px rgba(224, 66, 90, 0.5)',
},
```

### 7.2 三个必须遵守的坑（来自 CLAUDE.md）

1. **类名必须完整字面量，禁 `${}` 插值**。阵营分支一律用三元字面量：
   ```tsx
   // ✅ 正确
   isBlue ? 'border-ceremony-blue/40 hover:shadow-blue' : 'border-ceremony-red/40 hover:shadow-red'
   // ❌ 错误（JIT 不扫描，类名不生成）
   `border-ceremony-${side}/40`
   ```

2. **自定义 `boxShadow` 档位不支持 `/N` 透明度修饰符**。`shadow-gold/40` 会被误解析为阴影颜色染色、丢弃命名档位。需要不同强度就各自定义 key（`gold-sm`/`gold`/`gold-lg`），直接用 `shadow-gold`，不要写 `shadow-gold/40`。

3. **仅颜色阴影需配尺寸类**。`hover:shadow-ceremony-gold/30` 单独使用只设 `--tw-shadow-color`、不发 `box-shadow`。必须配一个尺寸类：`hover:shadow-lg hover:shadow-ceremony-gold/30`，或直接用自定义档位 `hover:shadow-gold`（档位自带尺寸+颜色）。

### 7.3 操作清单

- 修改 `tailwind.config.js` 后**必须重启 Vite dev server**（HMR 不重载 Tailwind 配置，否则样式"不生效"）。
- `@import` 字体语句必须放在 `globals.css` 所有 `@tailwind` 指令之前（沿用现有 `@import './design-system.css'` 的位置约定），否则触发 Vite CSS `@import must precede` 警告。
- `design-system.css` 的 `:root` 新增 `--ceremony-*` 变量，保留旧 `--lol-*` 变量作过渡别名（`--lol-blue: var(--ceremony-blue)` 等），避免一次性大面积替换引入回归。
- `globals.css` 的 `body` 由 `bg-slate-950` 改 `bg-ceremony-void text-ceremony-text`；`*` 默认边框由 `border-slate-800` 改 `border-ceremony-divider`。

---

## 8. 迁移成本评估

**整体成本：中**。

| 项 | 成本 | 原因 |
|----|------|------|
| 配色 token | 低 | 集中改 `tailwind.config.js` + `design-system.css`，旧变量保留别名过渡 |
| 字体 | 低 | 加一处 `@import` + `fontFamily` 配置，组件按需加 `font-serif`/`font-display` |
| TeamSlot 登场感 | 中 | 需新增"当前回合槽位"判定逻辑（BPContext 已有 `getCurrentPhase`，可派生 `isCurrentSlot`），加金角饰伪元素 |
| 阶段指示器戏剧性 | 中 | 改文案层级 + 扫光动效类，结构改动不大 |
| 分析卡片 | 低 | 仅替换颜色 token 与边框层级 |
| 布局面板宽度 | 低 | 改 `w-72`/`w-80` + 加金色分割线 |
| 动效 | 低-中 | 复用现有 `animate-glow`/`glow-*`/`fade-in`/`scale-in`，仅新增扫光 + 金角饰两段 CSS |

**可复用现有资产**（高复用率，这是成本可控的关键）：
- **`lol-gold` (#c8aa6e) 直接等于 `ceremony-gold`**，金色基调零成本继承。
- **glow 脉冲系统**（`animate-glow` + `glow-blue`/`glow-red`/`glow-gold` + `glow-pulse` keyframes）完全保留，仅把 `--glow-color` 的 rgba 值换成克制色。
- **shadow 三档体系**（`*-sm`/`*`/`*-lg`）结构不变，加一组 `gold-*`、改 `blue-*`/`red-*` 的 rgba 值即可。
- **动画 keyframes**（`fade-in`/`slide-in-up`/`scale-in`）直接复用。
- **`btn-game`/`input-game` 组件类**保留，只换内部颜色变量。
- **`cn()` 工具 + 字面量三元写法**的组件范式不变，HeroCard 已是范例，TeamSlot 照此改造即可。

**风险点**：队伍色降饱和后，蓝/红阵营区分度下降——需通过**金色徽记 + 文字色 + 小圆点**三重冗余保证可辨识（不依赖单一颜色，对色盲用户也更友好）。建议迁移后做一次色盲模拟校验。
