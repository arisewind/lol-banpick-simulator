# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

一个用于模拟英雄联盟禁用/选择阶段的 Windows 桌面应用程序。基于 Electron + React + TypeScript 构建，使用 React Context 进行状态管理，TailwindCSS 进行样式设计。

## 开发命令

```bash
# 仅前端开发（Vite 开发服务器在 localhost:5173）
pnpm dev

# 完整 Electron 开发（Vite + Electron 窗口）
pnpm electron:dev

# 构建前端
pnpm build

# 检查 TypeScript/TSX 文件
pnpm lint

# 预览生产构建
pnpm preview

# 构建 Windows 安装包（electron-builder）
pnpm electron:build
```

## 架构

### Electron 结构

```
electron/
├── main.js                    # 主进程入口，窗口创建
├── preload.js                 # 通过 contextBridge 实现 IPC 桥接
├── ipc/heroHandler.js         # 英雄数据的 IPC 处理器
└── services/heroService.js    # 带缓存的英雄数据服务
```

**IPC 模式**：主进程处理器注册在 `electron/ipc/heroHandler.js` 中。Preload 通过 `contextBridge` 暴露为 `window.electronAPI`。渲染进程通过 `await window.electronAPI.handlerName()` 调用。

可用的 IPC 方法：
- `fetchHeroes()` - 从 Data Dragon API 获取所有英雄
- `getHeroImageUrl(heroId)` - 获取英雄头像 URL
- `getCurrentVersion()` - 获取当前游戏版本
- `exportData(data)` - 导出 BP 数据（待实现）
- `importData()` - 导入 BP 数据（待实现）

### 状态管理（React Context）

App.tsx 中的三层嵌套 Context：

```
HeroContext (外层)
  └─ BPContext
      └─ DataContext (内层)
```

**HeroContext** (`src/contexts/HeroContext.tsx`)：
- 状态：`heroes`、`filteredHeroes`、`searchQuery`、`selectedTags`、`availableTags`
- 操作：`setSearchQuery`、`setSelectedTags`、`getHeroById`、`refreshHeroes`
- 数据源：通过 Electron IPC 从 Data Dragon API 获取
- 过滤逻辑：按名称/称号搜索 + 按标签过滤（OR 逻辑）

**BPContext** (`src/contexts/BPContext.tsx`)：
- 状态：`currentPhase`、`blueTeam`、`redTeam`、`history`、`isComplete`
- 操作：`banHero`、`pickHero`、`undo`、`reset`、`getCurrentPhase`
- BP_PHASES 常量：总共 20 步（10 个禁用 → 10 个选择）

**DataContext** (`src/contexts/DataContext.tsx`)：
- 状态：`recommendations`、`synergyAnalysis`、`matchupAnalysis`、`loading`
- 操作：`analyze`、`clear`
- 注意：分析逻辑尚未实现 - 这只是未来功能的存根

### 组件布局

App.tsx 三栏布局：
- **左侧** (`w-80`)：HeroGrid - 可搜索的英雄池，带标签过滤
- **中间** (`flex-1`)：BanPickArena - 显示蓝/红方队伍及其禁用/选择槽位
- **右侧** (`w-96`)：AnalysisPanel - 推荐和统计（存根）

### BP 流程不变量

当前操作始终由 `currentPhase` 索引到 `BP_PHASES` 决定。组件不应单独追踪"轮到哪一方"——始终从 `useBP().getCurrentPhase()` 读取。

**重要**：`banHero()` 和 `pickHero()` 包含重复检测——它们不会添加已被任一队伍禁用或选择的英雄。

## BP 阶段顺序参考

```
禁用阶段（第 1-10 步）：
蓝 → 红 → 蓝 → 红 → 蓝 → 红 → 红 → 蓝 → 红 → 蓝

选择阶段（第 11-20 步）：
蓝 → 红 → 红 → 蓝 → 蓝 → 红 → 红 → 蓝 → 蓝 → 红
```

此顺序定义在 `BPContext.tsx` 的 `BP_PHASES` 常量中。修改前请验证是否符合英雄联盟的实际规则。

## 类型系统

- `src/types/hero.ts` - Hero、HeroStats、CounterInfo、DataDragonResponse 类型
- `src/types/global.d.ts` - ElectronResponse<T>、ElectronAPI 接口、window.electronAPI

## TailwindCSS 自定义颜色

`tailwind.config.js` 中的扩展主题：
- `lol-blue`、`lol-red`、`lol-gold`、`lol-dark`、`lol-darker` - 英雄联盟品牌色

## 关键实现细节

### 英雄数据缓存

Electron 主进程（`electron/services/heroService.js`）实现了 6 小时的英雄数据缓存，以最小化对 Data Dragon 的 API 调用。缓存存储在 Map 中，应用重启时如过期则清除。

### Context Provider 嵌套顺序

HeroProvider 在最外层，因为其他组件可能需要独立于 BP 状态的英雄数据。BPProvider 在中间，因为 DataContext 依赖 BP 状态进行分析。DataProvider 在最内层，因为它仅被 AnalysisPanel 使用。

### TypeScript 配置

- `tsconfig.json` - 前端（src/），包含 React 类型、JSX
- `tsconfig.electron.json` - Electron 主进程（electron/），输出到 dist-electron/
- `tsconfig.node.json` - 仅 Vite 配置文件
