# 待办事项 TODO

## 🧩 功能模块

- [ ] **英雄数据模块** — 集成 Data Dragon API，加载英雄数据
  - 状态：✅ 基础已实现（[electron/services/heroService.js](electron/services/heroService.js) 带 6 小时缓存 + IPC + [src/contexts/HeroContext.tsx](src/contexts/HeroContext.tsx)）
- [ ] **BP 交互逻辑** — 实现点击英雄进行 Ban/Pick 操作
  - 状态：✅ 基础已实现（[src/contexts/BPContext.tsx](src/contexts/BPContext.tsx) 的 `banHero` / `pickHero`，含重复检测）
- [ ] **数据分析功能** — 集成第三方 API，实现推荐系统
  - 状态：🔲 未实现（[src/contexts/DataContext.tsx](src/contexts/DataContext.tsx) 目前为 stub，分析逻辑待补；与下方"搁置"的推荐 BP / 快速统计相关）
- [ ] **文件导入导出** — 保存和加载 BP 记录
  - 状态：🔲 未实现（`exportData` / `importData` 接口已在 [electron/preload.js](electron/preload.js) 占位，handler 待实现）

## 🐛 功能缺陷修复

- [ ] **搜索英雄时正确显示搜索内容**
  - 现象：在英雄搜索框中输入内容时，搜索内容未正确显示
  - 涉及：[src/contexts/HeroContext.tsx](src/contexts/HeroContext.tsx)（`searchQuery` 状态与过滤逻辑）、HeroGrid 组件的搜索输入框

## 🔄 规则调整

- [ ] **BP 规则：两边各 ban 3 个后开始选人**
  - 当前：`BP_PHASES` 为每边 ban 5 个（共 10 步 ban）后进入 pick 阶段
  - 目标：改为每边 ban 3 个（共 6 步 ban）后即进入 pick 阶段
  - 涉及：[src/contexts/BPContext.tsx](src/contexts/BPContext.tsx) 的 `BP_PHASES` 常量（同步调整 BanPickArena 等相关 UI 的步骤显示）

## 🌐 界面本地化

- [ ] **窗口 UI 全部改成中文**
  - 将应用界面中所有英文文案（按钮、标签、标题、提示等）替换为中文
  - 涉及：BanPickArena、HeroGrid、AnalysisPanel 等各组件

## ⏸️ 暂不实现（搁置）

- [x] ~~推荐 BP 功能~~（暂时无法实现）
- [x] ~~快速统计功能~~（暂时无法实现）
  - 说明：推荐 BP（`recommendations`）与快速统计（`synergyAnalysis` / `matchupAnalysis`）依赖尚未实现的分析逻辑，[src/contexts/DataContext.tsx](src/contexts/DataContext.tsx) 目前为 stub，暂不具备实现条件，先搁置
