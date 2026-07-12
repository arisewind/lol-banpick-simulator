# 英雄联盟 BP 模拟器 - 项目架构图

## 目录

- [1. 整体架构](#1-整体架构)
- [2. Electron 主进程架构](#2-electron-主进程架构)
- [3. React 渲染进程架构](#3-react-渲染进程架构)
- [4. Context Provider 嵌套关系](#4-context-provider-嵌套关系)
- [5. 数据流向](#5-数据流向)
- [6. 类型系统](#6-类型系统)
- [7. BP 流程状态机](#7-bp-流程状态机)
- [8. 文件结构](#8-文件结构)

---

## 1. 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Electron Application                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────┐          IPC          ┌─────────────────────┐ │
│  │   Main Process        │ ◄────────────────────► │  Renderer Process   │ │
│  │   (Node.js 环境)       │                       │  (React + Vite)     │ │
│  ├──────────────────────┤                       ├─────────────────────┤ │
│  │ • Window 管理         │                       │ • React UI          │ │
│  │ • IPC Handlers        │   contextBridge       │ • Context Providers │ │
│  │ • 数据获取 (fetch)    │ ───────────────────►  │ • Components        │ │
│  │ • 文件操作            │                       │ • Hooks             │ │
│  └──────────────────────┘                       └─────────────────────┘ │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Electron 主进程架构

### 文件结构

```
electron/
├── main.js (入口)
│   ├── createWindow() - 创建浏览器窗口
│   └── app.whenReady() - 应用生命周期
│
├── preload.js (IPC 桥接)
│   └── contextBridge.exposeInMainWorld('electronAPI', {
│        fetchHeroes: () → ipcRenderer.invoke('fetch-heroes')
│        getHeroImageUrl: (heroId) → ipcRenderer.invoke('get-hero-image-url')
│        getCurrentVersion: () → ipcRenderer.invoke('get-current-version')
│        exportData: (data) → ipcRenderer.invoke('export-data') [待实现]
│        importData: () → ipcRenderer.invoke('import-data') [待实现]
│      })
│
├── ipc/ (IPC 处理器)
│   └── heroHandler.js
│       └── registerHeroHandlers()
│           ├── 'fetch-heroes' → heroService.fetchHeroes()
│           ├── 'get-hero-image-url' → heroService.getHeroImageUrl()
│           └── 'get-current-version' → heroService.getCurrentVersion()
│
└── services/ (业务服务)
    └── heroService.js (单例)
        ├── heroesCache: Map<string, Hero>
        ├── versionCache: string
        ├── CACHE_DURATION: 6小时
        ├── fetchHeroes() → Hero[]
        ├── getHeroImageUrl(heroId) → URL
        ├── getCurrentVersion() → version
        └── getHeroById(id) → Hero
```

### 关键特性

- **缓存机制**：英雄数据缓存 6 小时，减少 API 请求
- **单例模式**：heroService 导出单例，全局共享数据
- **IPC 安全**：使用 contextBridge 安全暴露 API
- **错误处理**：所有 IPC 处理器都包含 try-catch

---

## 3. React 渲染进程架构

### 文件结构

```
src/
├── main.tsx
│   └── render(<App />) → ReactDOM.createRoot()
│
├── App.tsx (根组件)
│   └── Provider 嵌套结构:
│       <HeroProvider>
│         <BPProvider>
│           <DataProvider>
│             <AppContent />
│           </DataProvider>
│         </BPProvider>
│       </HeroProvider>
│
├── contexts/ (状态管理)
│   ├── HeroContext.tsx
│   │   ├── 状态: heroes, filteredHeroes, searchQuery, selectedTags, availableTags
│   │   ├── 操作: setSearchQuery, setSelectedTags, getHeroById, refreshHeroes
│   │   └── 数据源: window.electronAPI.fetchHeroes()
│   │
│   ├── BPContext.tsx
│   │   ├── 状态: currentPhase, blueTeam, redTeam, history, isComplete
│   │   ├── 操作: banHero, pickHero, undo, reset, getCurrentPhase
│   │   └── 常量: BP_PHASES[20] (10 ban + 10 pick)
│   │
│   └── DataContext.tsx
│       ├── 状态: recommendations, synergyAnalysis, matchupAnalysis, loading
│       ├── 操作: analyze, clear
│       └── 依赖: useBP() - 获取当前 BP 状态进行分析
│
├── components/
│   ├── bp/
│   │   ├── HeroGrid.tsx (英雄列表 + 搜索 + 标签过滤)
│   │   ├── HeroCard.tsx (单个英雄卡片 + 头像显示)
│   │   └── BanPickArena.tsx (BP 主舞台 + TeamSlot 组件)
│   │
│   └── analysis/
│       └── AnalysisPanel.tsx (推荐列表 + 统计信息)
│
└── types/
    ├── hero.ts (Hero, HeroStats, CounterInfo, DataDragonResponse)
    └── global.d.ts (ElectronResponse, ElectronAPI)
```

### Context 详细说明

#### HeroContext

管理英雄数据和过滤逻辑：

```typescript
interface HeroState {
  heroes: HeroWithStats[]          // 所有英雄
  filteredHeroes: HeroWithStats[]  // 过滤后的英雄
  searchQuery: string              // 搜索关键词
  selectedTags: string[]           // 选中的标签
  availableTags: string[]          // 所有可用标签
  loading: boolean                 // 加载状态
  error: string | null             // 错误信息
}
```

#### BPContext

管理 BP 流程状态：

```typescript
interface BPState {
  currentPhase: number             // 当前阶段索引 (0-19)
  blueTeam: TeamState              // 蓝方状态
  redTeam: TeamState               // 红方状态
  history: HeroAction[]            // 操作历史
  isComplete: boolean              // 是否完成
}

interface TeamState {
  bans: string[]                   // 禁用的英雄 ID
  picks: string[]                  // 选择的英雄 ID
}
```

#### DataContext

管理数据分析结果（待完善）：

```typescript
interface DataState {
  recommendations: Recommendation[]   // 推荐 Ban/Pick
  synergyAnalysis: SynergyScore      // 协同度分析
  matchupAnalysis: MatchupAnalysis   // 对阵分析
  loading: boolean                   // 分析中状态
}
```

---

## 4. Context Provider 嵌套关系

```
┌──────────────────────────────────────────────────────────┐
│ HeroProvider (最外层)                                     │
│ ┌────────────────────────────────────────────────────┐   │
│ │ BPProvider (中间层)                                │   │
│ │ ┌──────────────────────────────────────────────┐   │   │
│ │ │ DataProvider (最内层)                        │   │   │
│ │ │ ┌────────────────────────────────────────┐   │   │   │
│ │ │ │ AppContent                              │   │   │   │
│ │ │ │ ┌────────────────────────────────────┐  │   │   │   │
│ │ │ │ │  HeroGrid   │  BanPickArena │ Panel│ │   │   │   │
│ │ │ │ │  (useHeroes)│ (useBP)       │ (use)│ │   │   │   │
│ │ │ │ └────────────────────────────────────┘  │   │   │   │
│ │ │ └────────────────────────────────────────┘   │   │   │
│ │ └──────────────────────────────────────────────┘   │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘

依赖流向:
  HeroContext ───独立──────────────┐
                                        ├─► Components
  BPContext ───────────────────────┘
                    │
                    ▼
              DataContext (依赖 BPContext)
                    │
                    ▼
              AnalysisPanel
```

### 嵌套顺序的原因

1. **HeroProvider 在最外层**：其他组件可能需要访问英雄数据
2. **BPProvider 在中间**：DataContext 依赖 BP 状态进行分析
3. **DataProvider 在最内层**：只用于 AnalysisPanel

---

## 5. 数据流向

### 英雄数据获取流程

```
┌────────────────┐
│ Data Dragon API│
│  (英雄联盟官网) │
└────────┬───────┘
         │ HTTP fetch
         ▼
┌──────────────────┐     ┌──────────────────────┐
│ heroService.js   │────►│ IPC Handler          │
│ (缓存英雄数据)    │ IPC │ heroHandler.js       │
└──────────────────┘     └──────────┬───────────┘
                                    │ contextBridge
                                    ▼
                           ┌──────────────────────┐
                           │ window.electronAPI   │
                           │ (渲染进程可访问)     │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │ HeroContext          │
                           │ refreshHeroes()      │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │ HeroGrid Component   │
                           │ • 显示英雄列表       │
                           │ • 搜索/标签过滤      │
                           └──────────────────────┘
```

### 用户交互流向

```
用户点击英雄
       │
       ▼
HeroGrid.handleHeroClick()
       │
       ├─► BPContext.banHero() / pickHero()
       │        │
       │        ▼
       │   更新 blueTeam/redTeam 状态
       │        │
       │        ├─► BanPickArena 重新渲染
       │        └─► HeroGrid 更新 selectedIds
       │
       └─► DataContext.analyze() [待实现完整逻辑]
                │
                ▼
          AnalysisPanel 显示推荐
```

---

## 6. 类型系统

### types/hero.ts

```typescript
// 基本英雄信息
interface Hero {
  id: string
  name: string
  title: string
  blurb: string
  image: { full, sprite, group, x, y, w, h }
  tags: string[]
  version: string
}

// 英雄统计（待实现）
interface HeroStats {
  id: string
  winRate: number
  pickRate: number
  banRate: number
  tier: string
  kda: number
}

// 克制关系（待实现）
interface CounterInfo {
  strongAgainst: string[]
  weakAgainst: string[]
  synergies: string[]
}

// Data Dragon API 响应
interface DataDragonResponse {
  type: string
  format: string
  version: string
  data: { [key: string]: Hero }
}
```

### types/global.d.ts

```typescript
// IPC 响应联合类型
type ElectronResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// Electron API 接口
interface ElectronAPI {
  // 英雄数据 API
  fetchHeroes: () => Promise<ElectronResponse<Hero[]>>
  getHeroImageUrl: (heroId: string) => Promise<ElectronResponse<string>>
  getCurrentVersion: () => Promise<ElectronResponse<string>>

  // 文件操作 API（待实现）
  exportData: (data: unknown) => Promise<ElectronResponse<void>>
  importData: () => Promise<ElectronResponse<unknown>>

  // 平台信息
  platform: string
}
```

---

## 7. BP 流程状态机

### BP 阶段顺序

```
初始状态 (currentPhase = 0)
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Ban 阶段 (Phase 0-9)                                     │
│                                                         │
│  Step  │ Side  │ Action                                │
│  ──────┼───────┼────────                                │
│    1   │ Blue  │ Ban                                   │
│    2   │ Red   │ Ban                                   │
│    3   │ Blue  │ Ban                                   │
│    4   │ Red   │ Ban                                   │
│    5   │ Blue  │ Ban                                   │
│    6   │ Red   │ Ban                                   │
│    7   │ Red   │ Ban                                   │
│    8   │ Blue  │ Ban                                   │
│    9   │ Red   │ Ban                                   │
│   10   │ Blue  │ Ban                                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼ (10 bans 完成)
┌─────────────────────────────────────────────────────────┐
│ Pick 阶段 (Phase 10-19)                                  │
│                                                         │
│  Step  │ Side  │ Action                                │
│  ──────┼───────┼────────                                │
│   11   │ Blue  │ Pick                                  │
│   12   │ Red   │ Pick                                  │
│   13   │ Red   │ Pick                                  │
│   14   │ Blue  │ Pick                                  │
│   15   │ Blue  │ Pick                                  │
│   16   │ Red   │ Pick                                  │
│   17   │ Red   │ Pick                                  │
│   18   │ Blue  │ Pick                                  │
│   19   │ Blue  │ Pick                                  │
│   20   │ Red   │ Pick                                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼ (20 步完成)
              isComplete = true
```

### BP_PHASES 常量

```typescript
const BP_PHASES: BPPhase[] = [
  // Ban 阶段 (10个)
  { step: 1, side: 'blue', action: 'ban' },
  { step: 2, side: 'red', action: 'ban' },
  { step: 3, side: 'blue', action: 'ban' },
  { step: 4, side: 'red', action: 'ban' },
  { step: 5, side: 'blue', action: 'ban' },
  { step: 6, side: 'red', action: 'ban' },
  { step: 7, side: 'red', action: 'ban' },
  { step: 8, side: 'blue', action: 'ban' },
  { step: 9, side: 'red', action: 'ban' },
  { step: 10, side: 'blue', action: 'ban' },
  // Pick 阶段 (10个)
  { step: 11, side: 'blue', action: 'pick' },
  { step: 12, side: 'red', action: 'pick' },
  { step: 13, side: 'red', action: 'pick' },
  { step: 14, side: 'blue', action: 'pick' },
  { step: 15, side: 'blue', action: 'pick' },
  { step: 16, side: 'red', action: 'pick' },
  { step: 17, side: 'red', action: 'pick' },
  { step: 18, side: 'blue', action: 'pick' },
  { step: 19, side: 'blue', action: 'pick' },
  { step: 20, side: 'red', action: 'pick' },
]
```

---

## 8. 文件结构

### 完整目录树

```
lol-banpick-simulator/
├── electron/
│   ├── ipc/
│   │   └── heroHandler.js         # IPC 处理器
│   ├── services/
│   │   └── heroService.js         # 英雄数据服务
│   ├── main.js                    # Electron 入口
│   ├── preload.js                 # IPC 桥接
│   └── test*.js                   # 测试文件
│
├── src/
│   ├── components/
│   │   ├── analysis/
│   │   │   └── AnalysisPanel.tsx  # 分析面板
│   │   └── bp/
│   │       ├── BanPickArena.tsx   # BP 主舞台
│   │       ├── HeroCard.tsx       # 英雄卡片
│   │       └── HeroGrid.tsx       # 英雄网格
│   ├── contexts/
│   │   ├── BPContext.tsx          # BP 状态管理
│   │   ├── DataContext.tsx        # 数据分析状态
│   │   └── HeroContext.tsx        # 英雄数据状态
│   ├── types/
│   │   ├── global.d.ts            # 全局类型定义
│   │   └── hero.ts                # 英雄类型定义
│   ├── App.tsx                    # 根组件
│   └── main.tsx                   # React 入口
│
├── dist-electron/                 # Electron 编译输出
├── dist/                          # Vite 构建输出
├── node_modules/
├── index.html
├── package.json
├── tsconfig.json                  # 前端 TS 配置
├── tsconfig.electron.json         # Electron TS 配置
├── tsconfig.node.json             # Vite 配置 TS
├── vite.config.ts
├── tailwind.config.js
└── ARCHITECTURE.md                # 本文档
```

---

## 技术栈总结

| 层级 | 技术 |
|------|------|
| **桌面框架** | Electron |
| **前端框架** | React 18 + TypeScript |
| **构建工具** | Vite |
| **状态管理** | React Context |
| **样式** | TailwindCSS |
| **数据源** | Riot Data Dragon API |
| **IPC** | Electron ipcMain/ipcRenderer |

---

## 开发进度

### ✅ 已完成

- [x] Electron 主进程架构
- [x] IPC 通信桥接
- [x] 英雄数据获取和缓存
- [x] HeroContext 状态管理
- [x] BPContext 状态管理
- [x] HeroGrid 组件（搜索、过滤）
- [x] HeroCard 组件（头像显示）
- [x] BanPickArena 组件（BP 主舞台）
- [x] BP 流程状态机
- [x] 撤销/重置功能

### 🚧 待实现

- [ ] DataContext 分析逻辑
- [ ] AnalysisPanel 推荐算法
- [ ] 导入/导出功能
- [ ] 英雄统计数据获取
- [ ] 克制关系分析
- [ ] 协同度计算
- [ ] 数据持久化

---

*文档版本: 1.0.0*  
*最后更新: 2025-01-12*
