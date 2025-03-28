# Vite React 项目

这是一个使用 Vite 和 React 构建的现代化前端项目。项目采用 TypeScript 作为开发语言，集成了多个流行的前端库和工具。

## 技术栈

- **框架**: React 18
- **构建工具**: Vite 5
- **语言**: TypeScript 5
- **UI 组件库**: Antd Mobile 5
- **路由**: React Router 6
- **数据可视化**: ECharts 5
- **HTTP 客户端**: Axios
- **样式**: Less
- **代码规范**: ESLint

## 项目结构

```
├── public/              # 静态资源目录
├── src/                 # 源代码目录
│   ├── assets/         # 资源文件（图片、字体等）
│   ├── components/     # 公共组件
│   ├── hooks/          # 自定义 React Hooks
│   ├── layouts/        # 布局组件
│   ├── pages/          # 页面组件
│   ├── utils/          # 工具函数
│   ├── App.tsx         # 应用程序入口组件
│   ├── main.tsx        # 应用程序入口文件
│   └── index.less      # 全局样式
├── index.html          # HTML 模板
├── vite.config.ts      # Vite 配置文件
├── tsconfig.json       # TypeScript 配置
├── package.json        # 项目依赖和脚本
└── README.md           # 项目说明文档
```

## 开始使用

### 环境要求

- Node.js 16.0 或更高版本
- pnpm 8.0 或更高版本

### 安装依赖

```bash
pnpm install
```

### 开发模式

启动开发服务器：

```bash
pnpm dev
```

### 构建项目

构建生产环境版本：

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

### 代码检查

```bash
pnpm lint
```

## 主要功能

- 🚀 基于 Vite 的快速开发和构建
- 📱 移动端优先的 UI 设计
- 🎨 使用 Antd Mobile 组件库
- 📊 集成 ECharts 数据可视化
- 🛣️ 页面路由管理
- 📦 模块化的项目结构
- 🔍 TypeScript 类型检查
- 🎯 ESLint 代码规范

## 开发规范

- 使用 TypeScript 编写代码，确保类型安全
- 遵循 ESLint 配置的代码规范
- 组件采用函数式组件和 Hooks
- 使用 Less 编写模块化的样式
- 保持代码简洁、可读、可维护

## 注意事项

- 确保在提交代码前运行 lint 检查
- 遵循组件和工具函数的命名规范
- 及时更新依赖包版本，注意安全问题
- 保持良好的代码注释和文档更新

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

[MIT](LICENSE)
