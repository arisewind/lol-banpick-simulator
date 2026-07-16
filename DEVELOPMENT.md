# 开发计划 DEVELOPMENT

> **项目权威开发文档**，融合原 `TODO.md`（全量待办清单）+ `需求分析与实现方案报告.md`（功能方案）+ 当前开发计划。
> 单一信息源，避免多份文档重复漂移。最近更新：2026-07-17。
>
> **验证关卡**：`pnpm lint` + `pnpm typecheck:all` + `pnpm test:ci` + `pnpm test:coverage`（四道全绿方可合并）。

---

## 📊 项目审查报告（2026-07-15）

功能完整性与代码质量审查已完成，详细报告见 [report/](report/) 文件夹：

| 报告 | 文件 | 核心结论 |
|------|------|----------|
| 功能完整性 | [功能审查报告.md](report/功能审查报告.md) | ✅ 核心功能全部实现，BP 逻辑正确 |
| 代码质量 | [代码质量审查报告.md](report/代码质量审查报告.md) | ⚠️ 整体良好，需修复安全问题+提升测试覆盖 |

### 代码质量审查评分

- **代码质量**: 7.5/10 - 结构良好，存在重复代码
- **安全性**: 6.5/10 - Electron 配置安全，但 IPC 输入验证不足
- **可维护性**: 7.0/10 - 模块化合理，部分组件职责过重
- **性能**: 7.0/10 - 基本可接受，有优化空间
- **测试覆盖**: 5.0/10 - 核心逻辑覆盖较好，UI 组件覆盖不足

### 关键发现

**P0 级别（必须修复）**：
1. ~~IPC 输入验证不足~~ ✅ 已修复 2026-07-17 - 添加文件大小限制 + schema 验证
2. ~~类型断言滥用~~ ✅ 已修复 2026-07-17 - 创建 typeGuards.ts + 运行时验证

**P1 级别（应该修复）**：
1. ~~大文件需拆分~~ ✅ 已修复 2026-07-17 - BanPickArena 251→40 行，拆出 3 子组件
2. ~~测试覆盖不足~~ ✅ 已修复 2026-07-17 - 新增 18 用例，覆盖率 50.81%→60.92%
3. ~~调试日志残留~~ ✅ 已修复 2026-07-17 - 统一 logger 系统，生产环境静默 info/debug

---

## ✅ 本次会话完成（2026-07-15）

按"打地基先行 → 文件导入导出 → 数据分析"路线推进，全部完成：

1. **打地基**（6 步）：工具链（typecheck:all + vitest @alias + coverage 阈值）、i18n types 从 zh-CN 派生、零风险清理（死CSS/死类型/死动画/SLOTS_PER_TEAM）、heroService 缓存修复（早返回+lastFetch）、补测试（BPContext/HeroContext/i18nKeys）。测试 4→8 文件、43→79 用例，lines 覆盖率 31.7%→50.81%。
2. **文件导入导出**（路线图阶段1）：新建 [dataHandler.js](src/main/ipc/dataHandler.js)（依赖注入可测）+ main 注册 + [BPContext.loadSnapshot](src/contexts/BPContext.tsx)（schema 校验 + 字段白名单）+ [App.tsx](src/App.tsx) 按钮接 onClick + dataHandler/loadSnapshot 测试。端到端可用。
3. **数据分析 MVP**（路线图阶段2）：[src/analysis/rules/](src/analysis/rules/){synergy,matchup,recommend}.ts 纯函数（tag 级规则）+ constants + types + [DataContext](src/contexts/DataContext.tsx) 接线 + [AnalysisPanel](src/components/analysis/AnalysisPanel.tsx) 渲染真实协同/对阵数据（替换假占位）+ 12 个纯函数测试。规则用 tag 级通识（刺客→射手/法师 等），**具体英雄级 synergy/counter 表待人工扩充**。

四道关卡全绿：lint 0 警告 · typecheck:all 通过 · 79 用例全过 · 覆盖率阈值通过。
文档：新建 DEVELOPMENT.md 取代 TODO.md + 需求分析报告.md（已删）。

> **待 review**：① 导入导出 UI 反馈目前仅 console.error（无 toast）；② 数据分析规则表是 tag 级 MVP，具体英雄克制/synergy 数据需领域知识扩充；③ reset/undo 仍未调 data.clear()（分析残留，依赖DataContext，建议下轮处理）。

### 追加完成（技术债 + 交互完善）
- **reset/undo 清理分析状态**：[DataContext](src/contexts/DataContext.tsx) 监听 BP 变化（`currentPhase`/`history.length`）自动 `clear()`，避免残留过时推荐
- **导入导出 UI 反馈**：[App.tsx](src/App.tsx) notice 提示条（成功/失败，3 秒自动消失）+ i18n key（`exportSuccess`/`importSuccess`/`importInvalid`）三份 locale
- **合并 banHero/pickHero**：[BPContext](src/contexts/BPContext.tsx) 提取 `applyAction(heroId, expectedAction)` 共用核心逻辑，banHero/pickHero 退化为薄包装（接口不变，18 用例验证）
- **HeroContext error 状态 UI**：[HeroGrid](src/components/bp/HeroGrid.tsx) 解构 `error`/`refreshHeroes`，API 失败显示错误信息 + 重试按钮（`common.retry`）
- **语言切换 UI**：[App.tsx](src/App.tsx) header 加 简中/繁中/EN 切换按钮，繁中/英文从此可达
- **UI 全面调整方案**：生成 4 份风格迥异方案 + 索引，见 [docs/ui-proposals/README.md](docs/ui-proposals/README.md)（客户端仪式复刻 / 赛博朋克霓虹 / 玻璃拟态深空 / 极简数据流）
- **仍待 review**：① 数据分析规则表是 tag 级 MVP，需领域知识扩充；② 技术债剩 `getSelectedHeroIds` 提取 / `TeamPanel` / `useHeroImage`（留 UI 全面调整一并处理）

---

## 🚧 当前开发计划：打地基阶段（2026-07-15，已完成）

在动任何面向用户的功能（数据分析 / 导入导出）或重构之前，先补齐验证关卡、测试保护网与高优缺陷。**目标：为后续功能开发建安全网，本轮不新增用户可见功能。**

### 完成项

| 步骤 | 内容 | 产出 |
|------|------|------|
| ① 工具链 | `package.json` 补 `typecheck`/`typecheck:electron`/`typecheck:all`/`test:ci` 脚本；`tsconfig.electron.json` 加 `allowJs`（主进程首次纳入类型检查，浅层）；`vitest.config.ts` 加 `@`→src alias + v8 coverage 配置 + 阈值 | 主进程不再零类型检查 |
| ② i18n types | `src/i18n/types.ts` 的 `TranslationResources` 从 `zh-CN.json` 派生（`StringValues<typeof zhCN>`），`Language` 删不存在的 `'ko'` | 杜绝手写类型与 json 漂移 |
| ③ 零风险清理 | 删 `CounterInfo` 死类型 + `HeroContext` 重复的 `HeroWithStats` 定义；删 animations.css/design-system.css 未引用类（~150 行）；删 tailwind `animate-border`/`border-flow`；`BanPickArena` 魔法数 5 提 `SLOTS_PER_TEAM` 常量；导出 `BP_PHASES` | 代码对准干净基线 |
| ④ heroService 缓存 | `fetchHeroes` 顶部加 `if (!version && isCacheValid()) return cached` 早返回 + 写缓存后设 `this.lastFetch = Date.now()`；`currentVersion` 重命名 `BUILTIN_FALLBACK_VERSION`；加回归测试 | 修复"6 小时缓存只写不读"高优缺陷 |
| ⑤ 补测试 | `BPContext` 补 4 用例（多步 undo / undo 后重选 / BP_PHASES 顺序表断言 / 反向重复检测）；新建 `HeroContext.test.tsx`（搜索/标签OR/refreshHeroes 失败，7 用例）；新建 `i18nKeys.test.ts`（三 locale key 一致性） | 4 文件 43 用例 → 6 文件 57 用例；lines 覆盖率 31.7%→43.18% |

### 验证结果

四道关卡全绿：lint 0 警告 · typecheck:all 通过（electron 浅层）· 57 用例全过 · 覆盖率阈值通过（lines 30/stmts 30/branches 80/funcs 55，实际 43.18/43.18/88.4/66.66）。

### 关键陷阱（供后续参考）

1. **heroService 缓存三件套缺一不可**：早返回 + `!version` 限制（保留显式版本测试）+ 写缓存后设 `lastFetch`（原代码 `lastFetch` 只在 `getCurrentVersion` 成功路径设，显式版本路径从不设 → `isCacheValid()` 永远 false）。
2. **`typecheck:electron` 是浅层**：`allowJs:true + checkJs:false` 只验证配置与模块解析，不深度查 `.js` 主体。深度检查（`checkJs` + 为 `fetch` 加 `lib:DOM`）推迟到 electron-strict 阶段。
3. **Tailwind JIT 字面量**：`grid-cols-5` 必须保持字面量，常量只用于 `5 - length` 算术；改 `tailwind.config.js` 需重启 Vite dev server。
4. **测试 globals 关闭**：`describe/it/expect/vi` 显式从 `vitest` 导入；DOM 测试首行加 `/** @vitest-environment jsdom */`；`vitest.setup.ts` 的 `afterEach(cleanup)` 保留。
5. **i18n types 用 `StringValues<typeof zhCN>` 派生**：纯 `typeof zhCN` 会让叶子成字面量（如 `"禁用"`），跨语言校验靠运行时测试（`i18nKeys.test.ts`）不靠 `satisfies`。
6. **resolve.alias 用 ESM 形式** `fileURLToPath(new URL('./src', import.meta.url))`，非 `__dirname`。

---

## 🗺️ 后续阶段路线图

按《需求分析与实现方案报告》§4 优先级推进。打地基已完成，安全网就位。

### 阶段 1：文件导入导出（独立零依赖，~半天）✅ 已完成 2026-07-15

**现状**：preload 已暴露 `exportData`/`importData` 通道（[preload.js](src/main/preload.js)），`global.d.ts` 有签名，[App.tsx:65-69](src/App.tsx#L65) 有按钮，但 [heroHandler.js](src/main/ipc/heroHandler.js) 无 handler、按钮无 `onClick` → 端到端不可用。

**方案**（报告 §2）：
- 新增 `src/main/ipc/dataHandler.js`（仿 heroHandler 范式），注册 `export-data` / `import-data` 两个 `ipcMain.handle`，用 `dialog.showSaveDialog`/`showOpenDialog` + `fs` 读写；在 [main.js](src/main/main.js) 注册 `registerDataHandlers()`。
- [BPContext.tsx](src/contexts/BPContext.tsx) 新增 `loadSnapshot(snap)` 入口（内部 setState，导入前做 schema 校验 + 字段白名单）。
- [App.tsx:65-69](src/App.tsx#L65) 按钮补 `onClick`：导出传 `{currentPhase, blueTeam, redTeam, history, isComplete}` + renderer 侧生成的时间戳；导入调 `loadSnapshot`。
- 数据格式版本化 `{ version: 1, ... }` 便于迁移。
- **风险点**：导入 schema 校验 + 字段白名单（防恶意/损坏 JSON）；`Date.now()` 在 renderer 侧生成（主进程不信任传入时间）。

### 阶段 2：数据分析模块（本地规则引擎，报告 §1 方案 A）✅ MVP 已完成 2026-07-15

**现状**：[DataContext.tsx:50-90](src/contexts/DataContext.tsx#L50) 仍是 stub（三个 TODO，空 recommendations + 硬编码 50/50 平局）；[AnalysisPanel.tsx:128-140](src/components/analysis/AnalysisPanel.tsx#L128) 底部三行永久显示"计算中/分析中/待验证"假占位；`synergyAnalysis`/`matchupAnalysis` 算了但 UI 从未读取。

**方案**（报告 §1.4）：
```
src/analysis/
├── rules/
│   ├── synergy.ts        # 纯函数：阵容协同打分（标签多样性 + synergy 表组合加分）
│   ├── matchup.ts        # 纯函数：对阵优势（tag 克制规则 + counter 表逐对求差）
│   └── recommend.ts      # 纯函数：推荐（补齐己方缺位标签 / 克制对方核心，过滤已 ban/pick）
└── data/
    ├── synergy.json      # 人工维护 synergy 表
    └── counter.json      # 人工维护克制表
```
`DataContext.analyze()` 调用上述纯函数 → `AnalysisPanel` 解构渲染 `synergyAnalysis`/`matchupAnalysis`。**纯函数可单测**，正好用打地基补的测试基础设施 + `@` alias。

**数据源决策**（报告 §1.2）：无免费稳定合规的公开 API 直接给"推荐+胜率+克制"。Data Dragon 仅静态元数据（无胜率）；Riot API 不直接提供胜率需自聚合；U.GG/OP.GG 靠爬虫违反 TOS。故用本地规则引擎（方案 A），数据可控可测，精度取决于规则表质量。

### 阶段 3（远期）：Riot API 真实数据（报告 §1 方案 C）

需 API key + 聚合管道 + 存储，不适合当前单机 Electron 规模，远期排期。

### 搁置解除（报告 §3）

TODO 原搁置的"推荐 BP"/"快速统计"本质是数据分析的输出展示层（`recommendations`/`synergyAnalysis`/`matchupAnalysis`），随阶段 2 一并解除搁置。DataContext state 与 AnalysisPanel UI 已就位，只差把 stub 换成真实计算。

---

## 🎯 下一开发阶段：代码质量提升（基于审查报告）

根据代码质量审查结果，优先修复 P0/P1 级别问题，提升项目安全性和可维护性。

### 阶段 3：安全问题修复（P0）✅ 已完成 2026-07-17

**目标**：修复 IPC 输入验证和类型安全问题

| 任务 | 位置 | 完成内容 |
|------|------|------|
| IPC 文件大小限制 | `dataHandler.js` | ✅ 添加 5MB 文件大小限制 + `statSync` 检查 |
| IPC schema 验证 | `dataHandler.js` | ✅ 实现 `isValidBPSnapshot` 验证（版本号+TeamState 结构） |
| 类型断言修复 | `App.tsx`, `HeroContext.tsx` | ✅ 创建 `typeGuards.ts` + `isHeroArray`/`isValidBPSnapshotRenderer` |
| 测试更新 | `dataHandler.test.js` | ✅ 新增文件大小限制 + schema 验证测试（2 个） |

**验证结果**：
- ✅ 81 个测试全部通过（79 → 81）
- ✅ typecheck:all 通过
- ✅ 文件过大/格式非法时正确拒绝导入

**新建文件**：
- `src/utils/typeGuards.ts` - 类型保护函数库

### 阶段 4：代码清理与优化（P1）✅ 已完成 2026-07-17

**目标**：移除调试日志、提升测试覆盖率

| 任务 | 位置 | 完成内容 |
|------|------|------|
| 统一 logger 系统 | `src/main/utils/logger.js`（新建） | ✅ 替换主进程 console.log/error 为 logger（开发环境才输出 info/debug） |
| 拆分大文件 | `BanPickArena.tsx` 251→40 行 | ✅ 拆为 `TeamSlot`/`PhaseIndicator`/`TeamSection` 三个子组件，蓝红面板合并复用 |
| 补充 UI 测试 | `__tests__/` | ✅ 新增 PhaseIndicator(5)/TeamSlot(8)/BanPickArena(5) 共 18 个用例 |
| 性能优化 | `HeroCard`/`HeroGrid` | ✅ HeroCard 加 memo；onClick→onSelect 稳定接口；HeroGrid 用 useMemo 稳定 selectedIds + useCallback 稳定 handleHeroClick |

**验证结果**：
- ✅ 99 个测试全部通过（81 → 99）
- ✅ 覆盖率 lines 50.81% → **60.92%**（达成 60%+ 目标），branches 87.1%，funcs 72.34%
- ✅ 拆分后组件覆盖率：BanPickArena/PhaseIndicator/TeamSection 100%，TeamSlot 94%，HeroCard 100%

**新建/修改文件**：
- `src/main/utils/logger.js` - 统一日志工具
- `src/components/bp/TeamSlot.tsx` · `PhaseIndicator.tsx` · `TeamSection.tsx` - 拆分组件
- `src/components/bp/__tests__/PhaseIndicator.test.tsx` · `TeamSlot.test.tsx` · `BanPickArena.test.tsx` - 新增测试

---

## ✅ 已完成

### 核心功能
- **英雄数据模块** — Data Dragon API + 6 小时缓存 + IPC。[heroService.js](src/main/services/heroService.js) · [HeroContext.tsx](src/contexts/HeroContext.tsx)
- **BP 交互逻辑** — `banHero`/`pickHero` 含重复检测、撤销、重置。[BPContext.tsx](src/contexts/BPContext.tsx) · [BanPickArena.tsx](src/components/bp/BanPickArena.tsx)
- **BP 规则** — Ban1(ABABAB)/Pick1(ABBAAB)/Ban2(BABA)/Pick2(BAAB)，共 20 步

### 界面优化
- **i18n** — i18next + react-i18next，简中(默认)/繁中/英语。[src/i18n/locales/](src/i18n/locales/)
- **英雄网格** — 3 列，头像 64px
- **启动脚本** — `启动开发环境.bat` / `快速启动（仅前端）.bat` / `构建并运行.bat`

### 视觉与测试（2026-07-13）
- **UI 视觉升级** — 游戏化设计系统（design-system.css + animations.css + tailwind 发光阴影档位）
- **测试基础设施** — 分层测试（Vitest + @testing-library/react + jsdom）
- **ESLint 配置** — eslint 8 + @typescript-eslint + react-hooks/react-refresh
- **需求分析报告** — 数据分析走本地规则引擎（已并入本文档"后续阶段路线图"）

### 代码审查与清理（2026-07-14 ~ 07-15）
- **P0/P1 bug 修复（9 项）** — glow 重做为可合成 opacity 动画、步骤计数 21/20→20/20、进度条 105%→100%、i18n 硬编码修复、动作标签统一、完成圆点补 shadow 尺寸类、wait-on 加 30s 超时、findstr 锚定本地端口、globals.css `@import` 前置
- **死代码与重复清理** — animations.css 去重 keyframes、design-system.css 删死变量、HeroGrid/BanPickArena/HeroCard 嵌套 `cn()` 扁平化
- **子代理体系** — planner(opus) / refactor-cleaner(sonnet)；code-reviewer v1.8
- **工具链补充** — `@vitest/coverage-v8`；`electron:dev` wait-on 超时
- **文档** — CLAUDE.md 补 4 条 Tailwind 坑 + glow 归属修正
- **技能管理** — 卸载 Waza，改装 mattpocock/skills（项目本地 + gitignore）

### 打地基阶段（2026-07-15）
- 见上方"当前开发计划"。补 typecheck 脚本 / vitest alias+coverage / i18n types 派生 / 死 CSS+死类型+死动画清理 / SLOTS_PER_TEAM 常量 / heroService 缓存修复 / BPContext+HeroContext+i18n 测试补全。

---

## ✅ 待实现（功能）— 全部完成（2026-07-15）

- [x] **数据分析（本地规则引擎）** — 见"后续阶段路线图 · 阶段 2"（MVP 已完成）
- [x] **文件导入导出** — 见"后续阶段路线图 · 阶段 1"（已完成）
- [x] **HeroContext error 状态 UI** — [HeroGrid](src/components/bp/HeroGrid.tsx) 解构 `error`/`refreshHeroes`，API 失败时显示错误信息 + 重试按钮（`common.retry`）
- [x] **语言切换 UI** — [App.tsx](src/App.tsx) header 加 简中/繁中/EN 切换按钮（`i18n.changeLanguage`）
- [x] **reset/undo 清理分析状态** — [DataContext](src/contexts/DataContext.tsx) 监听 BP 变化（`currentPhase`/`history.length`）自动 `clear()`

---

## 🐛 已知缺陷

- [x] ~~**heroService 缓存只写不读**~~ — `高` — 已修复（打地基阶段④）：`fetchHeroes` 加早返回 + 写缓存后设 `lastFetch`
- [x] ~~**analyze stub 假占位**~~ — `中` — 已修复（数据分析 MVP 落地，AnalysisPanel 渲染真实协同/对阵数据，替换假占位）
- [x] ~~**版本硬编码**~~ — `低` — 已处理（打地基阶段④）：`currentVersion` 重命名 `BUILTIN_FALLBACK_VERSION` 并加注释说明是离线兜底；值 `'14.10.5'` 暂不动（Data Dragon 仍服务旧版本）

### 安全问题修复（2026-07-17）

- [x] ~~**IPC 输入验证不足**~~ — `高` — 已修复（阶段3）：`dataHandler.js` 添加 5MB 文件大小限制 + `isValidBPSnapshot` schema 验证
- [x] ~~**类型断言滥用**~~ — `高` — 已修复（阶段3）：创建 `typeGuards.ts` 类型保护库，`isHeroArray`/`isValidBPSnapshotRenderer` 替换 `as` 断言

> **已验证无问题**：重复检测（Set 覆盖双方 bans+picks，含反向 pick→ban）、20 步完成态 guard、undo history 一致性（含多步链 + 重选，打地基阶段⑤补测）、i18n 三份 locale key 对齐（打地基阶段⑤补 `i18nKeys.test.ts` 固化）、currentPhase 越界 guard、BP_PHASES 20 步顺序（打地基阶段⑤补顺序表断言）。

---

## 🏗️ 技术债 / 重构

### 重复代码（高 ROI）
- [x] ~~**合并 banHero/pickHero**~~ — `高` — 已完成：提取 `applyAction(heroId, expectedAction)` 共用核心逻辑
- [ ] **提取 getSelectedHeroIds 纯函数** — `中` — HeroGrid 已用 `useMemo` 稳定引用（阶段4），但纯函数提取到 utils 仍未做（BPContext 仍有内联）
- [x] ~~**抽 TeamPanel 子组件**~~ — `高` — 已完成（阶段4）：抽 `<TeamSection side team />`，蓝红面板合并，颜色字面量三元
- [x] ~~**抽 useHeroImage hook**~~ — `中` — 已完成：[useHeroImage.ts](src/hooks/useHeroImage.ts) 被 HeroCard 与 TeamSlot 共用

### 死代码清理
- [x] ~~**死 CSS 工具类**~~ — `高` — 已清理（打地基阶段③）：删 hover-glow-*/hover-lift/focus-ring/slot-*/border-game-*/card-base/bg-glass/animate-blink|shake|slide-in-down + 对应 keyframes；保留组件在用的 input-game/btn-game/glow-*/hover-scale/animate-glow 及全部 `:root` 变量
- [ ] **heroService 死方法** — `中` — `getSpriteUrl`/`getAllTags`/`isCacheValid`/`clearCache` 仅测试调用，无 IPC/内部引用。删或补 IPC 暴露（`getHeroById` 仍被使用，非死方法）
- [x] ~~**死类型**~~ — `中` — 已清理（打地基阶段③）：删 `CounterInfo`（零引用）；`HeroWithStats` 重复定义统一从 [types/hero.ts](src/types/hero.ts) 导入（保留 `HeroStats`，被 `HeroWithStats.stats` 引用）
- [x] ~~**tailwind 死动画**~~ — `低` — 已清理（打地基阶段③）：删 `animate-border`/`border-flow`

### 类型与配置
- [x] ~~**i18n types 脱节**~~ — `高` — 已修复（打地基阶段②）：`TranslationResources` 从 `zh-CN.json` 派生，`Language` 删 `'ko'`
- [x] ~~**魔法数 5**~~ — `低` — 已处理（打地基阶段③）：提 `SLOTS_PER_TEAM` 常量（`grid-cols-5` 保持字面量）
- [ ] **isDev 脆弱** — `低` — [main.js:9-10](src/main/main.js#L9) 用 `fs.existsSync` 判断，改 `app.isPackaged`
- [ ] **TeamSlot key 不一致** — `低` — 已填充用 heroId、空槽用索引，undo 重填时 key 类型切换。统一索引策略
- [ ] **getHeroImageUrl 走 IPC** — `低` — ~160 英雄 = 160 次 IPC 往返，URL 可在渲染层从 `hero.image.full`+`hero.version` 直接构造
- [ ] **tsconfig 严格度** — `中`（高破坏性，单独排期）— [tsconfig.json](tsconfig.json) 开 `noUncheckedIndexedAccess`/`noImplicitReturns`；[tsconfig.electron.json](tsconfig.electron.json) 开 `strict`（当前 `strict:false`）+ `checkJs` + 为 `fetch` 加 `lib:DOM`（实现真正的 electron 深度类型检查）

---

## 🧪 测试缺口

### 高优先级
- [x] ~~**HeroContext 过滤逻辑**~~ — 已补（打地基阶段⑤）：`HeroContext.test.tsx` 覆盖搜索(名/称号/大小写)+标签 OR+`refreshHeroes` 失败
- [x] ~~**i18n key 一致性测试**~~ — 已补（打地基阶段⑤）：`i18nKeys.test.ts` 递归比对三 locale key 集合
- [x] ~~**BPContext 盲区**~~ — 已补（打地基阶段⑤）：多步 undo 链 + undo 后重选 + `BP_PHASES` 20 步顺序表断言 + 反向重复检测

### 中优先级
- [x] ~~**BanPickArena / PhaseIndicator / TeamSlot**~~ — 已补（阶段4）：拆分后三组件共 18 用例，覆盖率 94~100%
- [ ] **HeroGrid 交互** — `中` — 点击分派 ban/pick、已选拦截、标签 toggle、loading/空列表分支（HeroCard 已 memo 化，集成测试待补）
- [ ] **heroHandler IPC 契约** — `中` — mock `ipcMain.handle`，断言 `{success,data}`/`{success:false,error}` 结构（dataHandler 已补 9 用例，heroHandler 待补）

> 当前测试：11 文件 99 用例（cn 7 / BPContext 18 / heroService 18 / HeroCard 8 / HeroContext 7 / i18nKeys 2 / analysis 12 / dataHandler 9 / PhaseIndicator 5 / TeamSlot 8 / BanPickArena 5）。覆盖率 lines 60.92% / branches 87.1% / funcs 72.34%。

---

## 🔧 工具链

### 高优先级
- [x] ~~**vitest resolve.alias**~~ — 已补（打地基阶段①）：`@`→src 别名
- [x] ~~**typecheck 脚本**~~ — 已补（打地基阶段①）：`typecheck`/`typecheck:electron`/`typecheck:all`（electron 为浅层，深度检查见技术债"tsconfig 严格度"）
- [x] ~~**coverage 配置**~~ — 已补（打地基阶段①）：provider v8 + include/exclude + 阈值（lines/stmts 30、branches 80、funcs 55）

### 中优先级
- [ ] **tsconfig 严格度** — `中` — 见技术债
- [ ] **eslint 8 EOL** — `中` — 升 eslint 9 + @typescript-eslint v8 + flat config（单独 PR）
- [ ] **vitest 1 EOL** — `中` — 升 vitest 2/3 + coverage 包同步
- [ ] **依赖过时** — `低` — react 18.3 / tailwind 3.4 / vite 5.3 / electron-builder 24 / jsdom 24 / concurrently 8（随 vitest/eslint 升级排期）

---

## ⏸️ 暂不实现（搁置）

- [x] ~~推荐 BP 功能~~（报告判定：可解除搁置）
- [x] ~~快速统计功能~~（报告判定：可解除搁置）
  - 说明：推荐 BP（`recommendations`）与快速统计（`synergyAnalysis`/`matchupAnalysis`）本质与"数据分析功能"同源，随阶段 2 本地规则引擎落地一并解除搁置。见"后续阶段路线图"。

---

## 📋 技术栈

- **前端**: React 18 + TypeScript + Vite
- **桌面端**: Electron 43
- **样式**: TailwindCSS
- **状态管理**: React Context
- **国际化**: i18next + react-i18next
- **测试**: Vitest + @testing-library/react + jsdom
- **包管理**: pnpm
- **英雄数据**: Riot Data Dragon API

---

## 🚀 快速启动

双击 `启动开发环境.bat` 即可启动应用。或：

```bash
pnpm dev              # 仅前端
pnpm electron:dev     # Electron + Vite
pnpm lint             # lint（--max-warnings 0）
pnpm typecheck:all    # 前端 + electron 类型检查
pnpm test:ci          # 测试（vitest run）
pnpm test:coverage    # 测试 + 覆盖率阈值校验
```
