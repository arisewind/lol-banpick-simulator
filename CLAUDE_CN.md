# CLAUDE_CN.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。它是 [CLAUDE.md](CLAUDE.md) 的中文版，两者内容保持同步；若有出入，以英文版为准。

## 项目概述

一个用于模拟英雄联盟（League of Legends）Ban/Pick 阶段的 Windows 桌面应用。基于 Electron + React + TypeScript 构建，使用 React Context 做状态管理，TailwindCSS 做样式。

**包管理器**：pnpm（非 npm）。项目使用 pnpm 11+，并为 electron 开放了特定的 build 脚本权限。

**快速开始**：双击 `启动开发环境.bat` 启动完整的 Electron 开发环境。

## 开发命令

```bash
# 仅前端开发（Vite 开发服务器，localhost:5173）
pnpm dev

# 完整 Electron 开发（Vite + Electron 窗口）
pnpm electron:dev

# 构建前端
pnpm build

# 代码检查（ESLint，配置见 .eslintrc.cjs）
pnpm lint

# 仅类型检查、不产出（主要的静态检查手段）
pnpm tsc --noEmit

# 运行一次测试（Vitest）
pnpm test

# 运行单个测试文件 / 按用例名匹配
pnpm test src/utils/__tests__/cn.test.ts
pnpm test -t "拼接多个字符串类名"

# 监听模式 / 覆盖率
pnpm test:watch
pnpm test:coverage

# 预览生产构建
pnpm preview

# 构建 Windows 安装包（electron-builder）
pnpm electron:build
```

> **Lint 配置**：[.eslintrc.cjs](.eslintrc.cjs) —— eslint 8 + `@typescript-eslint` + react-hooks/react-refresh，标准基线 + 单引号 / 无分号风格。两处 override：`src/main/*.js`（CommonJS）用 espree + node 环境；`src/contexts/**` 关闭 `react-refresh/only-export-components`（provider + hook + 默认导出共存是预期模式）。验证关卡：`pnpm lint` + `pnpm tsc --noEmit` + `pnpm test`。

**替代方式**：使用项目根目录的批处理脚本：
- `启动开发环境.bat` - 完整 Electron 开发
- `快速启动（仅前端）.bat` - 仅前端
- `构建并运行.bat` - 构建生产版本

## pnpm 配置

项目使用 pnpm 11+。关键配置文件：

- **pnpm-workspace.yaml**：包含 `allowBuilds` 白名单，允许 electron 和 esbuild 执行 postinstall 脚本。这是下载 electron 二进制所必需的。已废弃的 `package.json#pnpm` 字段**未**使用。
- **.npmrc**：配置 npmmirror.com 镜像，加速国内 electron 二进制下载。

## Electron 调试

**重要**：若遇到 `TypeError: Cannot read properties of undefined (reading 'whenReady')`，根因很可能是设置了 `ELECTRON_RUN_AS_NODE=1` 环境变量。这会让 electron 以纯 node 解释器模式运行，而非 app 模式。

**诊断清单**：
1. 检查 `node_modules/electron/dist/electron.exe` 和 `path.txt` 是否存在。若缺失，执行：`ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ node node_modules/electron/install.js`
2. 检查 `env | grep ELECTRON_RUN_AS_NODE`。若为 `1`，运行前先取消：`unset ELECTRON_RUN_AS_NODE`
3. 仅在以上两项都核实无误后，才怀疑代码问题。

## 测试

测试套件（Vitest + @testing-library/react + jsdom）遵循 [`AGENTS-Subject of Imitation.md`](AGENTS-Subject%20of%20Imitation.md)（LambChat 开发指南）定义的分层测试约定——该文件是本仓库测试风格的权威参照。

- **配置**：`vitest.config.ts`（默认环境 `node`）；全局 setup 为 `vitest.setup.ts`。
- **位置**：`src/**/__tests__/**/*.test.{ts,tsx,js}`，与被测代码同目录。
- **按环境分层**：
  - 纯工具函数 & Electron 主进程逻辑 → 默认 `node` 环境（快、无 DOM）。如 `src/utils/__tests__/cn.test.ts`、`src/main/services/__tests__/heroService.test.js`。
  - 需要 DOM 的组件 & Hook → 在文件**第一行**加 `/** @vitest-environment jsdom */`。如 `src/components/bp/__tests__/HeroCard.test.tsx`、`src/contexts/__tests__/BPContext.test.tsx`。
- **globals 未开启**（`test.globals` 未启用），所以 `@testing-library/react` 内置的 auto-cleanup **不会**触发。`vitest.setup.ts` 手动注册了 `afterEach(cleanup)`，防止 `screen` 查询跨用例泄漏——请保留。
- **组件测试**统一 mock `react-i18next`（`useTranslation: () => ({ t: (k) => k })`）并 stub `window.electronAPI`，因为这两者在 Electron 之外都不存在。

本项目没有独立的后端服务：这里的"后端"即 Electron 主进程（`src/main/`），在 node 环境下测试。

## 架构

### Electron 结构

```
src/main/
├── main.js                    # 主进程入口，窗口创建
├── preload.js                 # 通过 contextBridge 实现 IPC 桥接
├── ipc/
│   └── heroHandler.js         # 英雄数据的 IPC 处理器
└── services/
    └── heroService.js         # 带缓存的英雄数据服务
```

**IPC 模式**：主进程处理器注册在 `src/main/ipc/heroHandler.js`。Preload 通过 `contextBridge` 暴露为 `window.electronAPI`。渲染进程通过 `await window.electronAPI.handlerName()` 调用。

可用的 IPC 方法：
- `fetchHeroes()` - 从 Data Dragon API 获取所有英雄
- `getHeroImageUrl(heroId)` - 获取英雄头像 URL
- `getCurrentVersion()` - 获取当前游戏版本
- `exportData(data)` - 导出 BP 数据（待实现）
- `importData()` - 导入 BP 数据（待实现）

### 状态管理（React Context）

App.tsx 中三层嵌套的 Context：

```
HeroContext (外层)
  └─ BPContext
      └─ DataContext (内层)
```

**HeroContext** (`src/contexts/HeroContext.tsx`)：
- 状态：`heroes`、`filteredHeroes`、`searchQuery`、`selectedTags`、`availableTags`
- 操作：`setSearchQuery`、`setSelectedTags`、`getHeroById`、`refreshHeroes`
- 数据源：通过 Electron IPC 访问 Data Dragon API（zh_CN locale，中文名）
- 过滤逻辑：按名称/称号搜索 + 按标签过滤（OR 逻辑）

**BPContext** (`src/contexts/BPContext.tsx`)：
- 状态：`currentPhase`、`blueTeam`、`redTeam`、`history`、`isComplete`
- 操作：`banHero`、`pickHero`、`undo`、`reset`、`getCurrentPhase`
- BP_PHASES 常量：共 20 步

**DataContext** (`src/contexts/DataContext.tsx`)：
- 状态：`recommendations`、`synergyAnalysis`、`matchupAnalysis`、`loading`
- 操作：`analyze`、`clear`
- 注意：分析逻辑尚未实现——目前只是未来功能的存根

### i18n 配置

项目使用 i18next 做国际化：

```
src/i18n/
├── locales/
│   ├── zh-CN.json    # 简体中文（默认）
│   ├── zh-TW.json    # 繁体中文
│   └── en.json       # 英语
├── types.ts          # TypeScript 类型定义
└── index.ts          # i18next 配置
```

组件中的用法：
```typescript
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
// 如：t('bp.ban')、t('hero.tags.assassin') 等
```

### 组件布局

App.tsx 三栏布局：
- **左** (`w-80`)：HeroGrid - 可搜索的英雄池，带标签过滤（3 列网格，64px 头像）
- **中** (`flex-1`)：BanPickArena - 展示蓝/红方队伍及其 ban/pick 槽位
- **右** (`w-96`)：AnalysisPanel - 推荐与统计（存根）

### BP 流程不变量

当前操作始终由 `currentPhase` 对 `BP_PHASES` 的索引决定。组件不应另行追踪"轮到哪一方"——始终从 `useBP().getCurrentPhase()` 读取。

**重要**：`banHero()` 和 `pickHero()` 含重复检测——不会添加已被任一方 ban 或 pick 的英雄。

## BP 阶段顺序参考

**现行规则**（A=蓝方，B=红方）：

```
第 1-6 步：   Ban 阶段 1  (ABABAB) - 填满每方前 3 个 ban 位
第 7-12 步：  Pick 阶段 1 (ABBAAB)
第 13-16 步： Ban 阶段 2  (BABA)   - 填满每方后 2 个 ban 位
第 17-20 步： Pick 阶段 2 (BAAB)
```

每方共 5 个 ban 位（UI 中显示），分两阶段填满：
- **队伍**：蓝 | 红
- **Ban 1**：第 1,3,5 步 | 第 2,4,6 步
- **Ban 2**：第 14,16 步 | 第 13,15 步

此顺序定义在 `BPContext.tsx` 的 `BP_PHASES` 常量中。修改前请务必对照英雄联盟实际规则验证。

## 类型系统

- `src/types/hero.ts` - Hero、HeroStats、CounterInfo、DataDragonResponse 类型
- `src/types/global.d.ts` - ElectronResponse<T>、ElectronAPI 接口、window.electronAPI

## TailwindCSS 与样式

主题扩展位于 `tailwind.config.js`：

- **颜色**：`lol-blue` / `-glow` / `-dark`，`lol-red` / `-glow` / `-dark`，`lol-gold` / `-glow`，以及 `lol-dark`、`lol-darker`。
- **发光阴影档位**：`blue-sm` / `blue` / `blue-lg`，`red-*` 与 `gold-*` 同样有 `-sm` / `-lg` 档位。
- **动画**：`border`、`fade-in`、`slide-in-up`、`scale-in` 由配置驱动（keyframes 同处于 `tailwind.config.js`）；`glow` 位于 `src/styles/animations.css`（在 `::after` 上做 opacity 脉冲，队伍色由 `.glow-blue/red/gold` 类设定）。

**自定义 `boxShadow` 键不支持 Tailwind 的透明度修饰符。** 写 `shadow-blue/40` 会被静默误解析为阴影*颜色*染色，根本不产生发光——该命名键被忽略。因此每一档强度都是独立的显式键（`blue-sm` / `blue` / `blue-lg`）：请直接使用这些命名档位，绝不要给它们加 `/N`。（标准颜色工具如 `border-lol-blue/30` 不受影响——此陷阱仅针对自定义 `boxShadow` 键。）

**仅颜色的阴影工具类，缺少尺寸类时不产生阴影。** 单独写 `shadow-green-500/50`（或 `shadow-lol-blue/30`）只会设置 `--tw-shadow-color`；除非同时存在尺寸工具类（`shadow` / `shadow-md` / `shadow-lg`），否则 Tailwind 不会发出 `box-shadow`。请务必把颜色工具类与尺寸类配对使用，否则预期的发光会静默失效。（这是上面 `/N` 陷阱的姊妹坑。）

**`@import` 语句必须位于 `@tailwind` 指令之前。** 在 `globals.css` 中，把所有 `@import` 行放在最顶部，在 `@tailwind base/components/utilities` 之前。否则 Vite 每次构建都会为每条 import 打印 `[vite:css] @import must precede all other statements` 警告，未来更严格的 Vite/PostCSS 版本可能静默丢弃被导入的 CSS（导致所有 `var(--lol-*)` token 与自定义类失效）。`@layer` 块无论 import 位置如何都能正确合并。

**绝不要用字符串插值拼接 Tailwind 类名。** JIT 扫描器只为源码中以**完整字面量**出现的类名生成 CSS。`border-${color}`、`bg-${side}`、`shadow-${x}` 完全不产生 CSS——该类会静默从构建中消失，而且引入这种写法的重构会通过全部单测（单测不检查 CSS 生成）。合并颜色分支（ban/pick、红/蓝）时，使用**完整字面量的三元**（`isBan ? 'border-lol-red/40 hover:shadow-red' : 'border-lol-blue/40 hover:shadow-blue'`）或**字面量查表对象**。另外注意自定义 `boxShadow` 键是 `shadow-red` / `shadow-blue`（档位名），不是 `shadow-lol-red`。

**修改 `tailwind.config.js` 后必须重启 Vite dev server。** HMR 不会重载 Tailwind 配置，所以配置驱动的样式改动在重启前会表现为"不生效"。

游戏感设计 token 与动效位于 `src/styles/`，由应用入口一次性引入：`main.tsx` → `globals.css` →（`@import './design-system.css'`、`@import './animations.css'`）。请在此添加 CSS 自定义属性 / keyframes，不要内联到组件里。

## 关键实现细节

### 英雄数据缓存

Electron 主进程（`src/main/services/heroService.js`）实现了 6 小时的英雄数据缓存，以尽量减少对 Data Dragon 的 API 调用。缓存放于 Map 中，过期则在应用重启时清空。

**Data Dragon locale**：使用 `zh_CN` 端点，返回中文英雄名与描述。

### Context Provider 嵌套顺序

HeroProvider 在最外层，因为其他组件可能需要独立于 BP 状态的英雄数据。BPProvider 居中，因为 DataContext 依赖 BP 状态做分析。DataProvider 在最内层，因其仅被 AnalysisPanel 使用。

### TypeScript 配置

- `tsconfig.json` - 前端（src/），含 React 类型、JSX
- `tsconfig.electron.json` - Electron 主进程（src/main/），输出到 build/main/
- `tsconfig.node.json` - 仅 Vite 配置文件
