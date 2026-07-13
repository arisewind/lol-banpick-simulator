# 待办事项 TODO

## ✅ 已完成

### 核心功能
- [x] **英雄数据模块** — 集成 Data Dragon API，加载英雄数据
  - 实现：[electron/services/heroService.js](electron/services/heroService.js) 带 6 小时缓存 + IPC
  - Context：[src/contexts/HeroContext.tsx](src/contexts/HeroContext.tsx)
  - 支持英雄搜索、标签过滤、图片加载

- [x] **BP 交互逻辑** — 实现点击英雄进行 Ban/Pick 操作
  - 实现：[src/contexts/BPContext.tsx](src/contexts/BPContext.tsx) 的 `banHero` / `pickHero`
  - 含重复检测、撤销、重置功能
  - UI：[src/components/bp/BanPickArena.tsx](src/components/bp/BanPickArena.tsx)

- [x] **BP 规则调整** — 新规则已实施
  - Ban 1 阶段（步骤 1-6）：ABABAB（填满前 3 个 ban 位）
  - Pick 1 阶段（步骤 7-12）：ABBAAB
  - Ban 2 阶段（步骤 13-16）：BABA（填满后 2 个 ban 位）
  - Pick 2 阶段（步骤 17-20）：BAAB

### 界面优化
- [x] **界面本地化（i18n）** — 完整的多语言支持
  - 实现：i18next + react-i18next
  - 支持语言：简体中文（默认）、繁体中文、英语
  - 资源文件：[src/i18n/locales/](src/i18n/locales/)
  - 配置：[src/i18n/index.ts](src/i18n/index.ts)

- [x] **英雄网格布局优化** — 头像不被遮挡
  - 从 4 列改为 3 列，头像从 48px 增加到 64px
  - 增加间距和内边距

- [x] **启动脚本** — 快速启动入口
  - `启动开发环境.bat` - 完整 Electron 开发环境
  - `快速启动（仅前端）.bat` - 仅 Vite 前端
  - `构建并运行.bat` - 构建生产版本

---

## 🔲 待实现

### 功能模块
- [ ] **数据分析功能** — 集成第三方 API，实现推荐系统
  - 状态：🔲 未实现
  - 位置：[src/contexts/DataContext.tsx](src/contexts/DataContext.tsx) 目前为 stub
  - 相关：推荐 BP / 快速统计 / 阵容协同度 / 对阵优势

- [ ] **文件导入导出** — 保存和加载 BP 记录
  - 状态：🔲 未实现
  - 接口已在 [electron/preload.js](electron/preload.js) 占位
  - 需要实现 `exportData` / `importData` handler

### 功能缺陷
- [ ] **搜索英雄时正确显示搜索内容**
  - 现象：在英雄搜索框中输入内容时，搜索内容未正确显示
  - 涉及：[src/contexts/HeroContext.tsx](src/contexts/HeroContext.tsx)、HeroGrid 组件

---

## ⏸️ 暂不实现（搁置）

- [x] ~~推荐 BP 功能~~（暂时无法实现）
- [x] ~~快速统计功能~~（暂时无法实现）
  - 说明：推荐 BP（`recommendations`）与快速统计（`synergyAnalysis` / `matchupAnalysis`）依赖尚未实现的分析逻辑，[src/contexts/DataContext.tsx](src/contexts/DataContext.tsx) 目前为 stub，暂不具备实现条件，先搁置

---

## 📋 技术栈

- **前端**: React 18 + TypeScript + Vite
- **桌面端**: Electron 43
- **样式**: TailwindCSS
- **状态管理**: React Context
- **国际化**: i18next + react-i18next
- **包管理**: pnpm
- **英雄数据**: Riot Data Dragon API

---

## 🚀 快速启动

双击 `启动开发环境.bat` 即可启动应用。
