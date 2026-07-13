// ESLint 配置（eslint 8 + .eslintrc 格式）
// 项目为 ESM 风格（配置文件用 export default）但 package.json 无 "type": "module"，
// 故本文件用 .cjs 显式 CJS，避免 .js 被当 CJS 解析时 export default 报错。
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh'],
  rules: {
    // TS 项目用类型检查管未定义符号，关掉 ESLint 的 no-undef，避免对 window/document 等全局误报
    'no-undef': 'off',
    // 风格：对齐现有代码（单引号 / 无分号 —— Vite React TS 模板风格）
    'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'semi': ['error', 'never'],
    // 未用变量：与 tsconfig noUnusedLocals 一致，允许 _ 前缀
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // fast-refresh：组件文件应只导出组件
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
  ignorePatterns: [
    'dist', 'build', 'release', 'node_modules',
    '*.config.ts', '*.config.js',   // vite/tailwind/postcss/vitest 配置，非业务代码
    'vitest.setup.ts',
  ],
  overrides: [
    {
      // Context 文件：provider + hook + 默认导出共存是正常模式，免 fast-refresh 告警
      files: ['src/contexts/**/*.tsx'],
      rules: { 'react-refresh/only-export-components': 'off' },
    },
    {
      // Electron 主进程：CommonJS（require/module.exports），用轻量 espree + node 全局，
      // 避开 @typescript-eslint/parser 对 require/module/__dirname 的误报。
      // 精确列出非测试路径，使 __tests__ 下的 js（ESM import）仍走默认 TS parser + module。
      files: ['src/main/*.js', 'src/main/ipc/*.js', 'src/main/services/*.js'],
      parser: 'espree',
      parserOptions: { ecmaVersion: 2020, sourceType: 'script' },
      env: { node: true, browser: false, commonjs: true },
      rules: { '@typescript-eslint/no-var-requires': 'off' },
    },
  ],
}
