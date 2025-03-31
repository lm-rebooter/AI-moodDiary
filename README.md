# Vite React 项目模板

<div align="center">

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Ant-Design](https://img.shields.io/badge/-AntDesign-%230170FE?style=for-the-badge&logo=ant-design&logoColor=white)

</div>

## 📝 项目介绍

这是一个基于 Vite 和 React 构建的现代化前端项目模板。项目采用 TypeScript 作为开发语言，集成了当下流行的前端技术栈和工具链，旨在提供一个高效、可扩展的开发框架。

### ✨ 特性

- 🚀 基于 Vite 的极速开发体验
- 💪 TypeScript 支持
- 📱 移动端优先的 UI 设计
- 🎨 集成 Antd Mobile 组件库
- 📊 ECharts 数据可视化支持
- 🛣️ React Router 路由管理
- 📦 模块化的项目结构
- 🔍 ESLint + Prettier 代码规范
- 🎯 Git Hooks 和 提交规范

## 🛠️ 技术栈

### 前端技术
- **核心框架**: React 18
- **构建工具**: Vite 5
- **开发语言**: TypeScript 5
- **UI 框架**: Antd Mobile 5
- **路由管理**: React Router 6
- **数据可视化**: ECharts 5
- **HTTP 请求**: Axios
- **CSS 预处理**: Less
- **代码规范**: ESLint + Prettier
- **包管理器**: pnpm

### 后端技术
- **运行环境**: Node.js
- **Web框架**: Express.js / Koa2
- **数据库**: MongoDB
- **ORM工具**: Mongoose
- **身份认证**: JWT (JSON Web Token)
- **API文档**: Swagger / OpenAPI
- **缓存**: Redis
- **消息队列**: RabbitMQ (可选)
- **日志管理**: Winston
- **单元测试**: Jest

## 🖥️ 服务端架构

### 目录结构
```
server/
├── src/
│   ├── config/          # 配置文件目录
│   │   ├── db.ts       # 数据库配置
│   │   ├── redis.ts    # Redis配置
│   │   └── jwt.ts      # JWT配置
│   ├── controllers/    # 控制器层
│   ├── models/        # 数据模型层
│   ├── routes/        # 路由层
│   ├── services/      # 业务逻辑层
│   ├── middlewares/   # 中间件
│   ├── utils/         # 工具函数
│   ├── types/         # 类型定义
│   └── app.ts         # 应用入口文件
├── tests/             # 测试文件目录
├── logs/              # 日志文件目录
├── .env              # 环境变量
└── package.json      # 项目依赖
```

### API 文档
API 遵循 RESTful 设计规范，主要包含以下模块：

- 用户认证 (`/api/auth`)
  - 登录
  - 注册
  - 刷新令牌
- 用户管理 (`/api/users`)
  - 用户信息 CRUD
  - 权限管理
- 数据管理 (`/api/data`)
  - 数据增删改查
  - 数据统计

### 环境配置
```bash
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/your_database

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 启动服务

```bash
# 进入服务端目录
cd server

# 安装依赖
pnpm install

# 开发模式启动
pnpm dev

# 生产模式构建
pnpm build

# 生产模式启动
pnpm start

# 运行测试
pnpm test
```

### 数据库设计

主要数据模型：

```typescript
// 用户模型
interface IUser {
  id: string;
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// 数据模型
interface IData {
  id: string;
  title: string;
  content: string;
  userId: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}
```

### 安全措施

- 使用 JWT 进行身份验证
- 密码加密存储
- 请求速率限制
- CORS 配置
- 数据验证
- XSS 防护
- CSRF 防护

### 性能优化

- 数据库索引优化
- 缓存策略
- 压缩响应
- 负载均衡
- 日志分级
- 错误处理

## 📁 项目结构

```
├── public/                # 静态资源目录
├── src/                   # 源代码目录
│   ├── assets/           # 资源文件（图片、字体等）
│   ├── components/       # 公共组件
│   │   ├── common/      # 通用组件
│   │   └── business/    # 业务组件
│   ├── hooks/           # 自定义 React Hooks
│   ├── layouts/         # 布局组件
│   ├── pages/           # 页面组件
│   ├── services/        # API 服务
│   ├── stores/          # 状态管理
│   ├── styles/          # 全局样式
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 应用程序入口组件
│   ├── main.tsx         # 应用程序入口文件
│   └── index.less       # 全局样式
├── .eslintrc.js         # ESLint 配置
├── .prettierrc          # Prettier 配置
├── index.html           # HTML 模板
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
├── package.json         # 项目依赖和脚本
└── README.md            # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 安装

```bash
# 克隆项目
git clone [repository-url]

# 进入项目目录
cd vite-project

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 📖 开发指南

### 编码规范

- 使用 TypeScript 编写代码，确保类型安全
- 遵循项目的 ESLint 和 Prettier 配置
- 组件开发规范：
  - 使用函数式组件和 Hooks
  - 组件文件使用 PascalCase 命名
  - 工具函数使用 camelCase 命名
  - 常量使用 UPPER_CASE 命名

### 提交规范

提交信息格式：
```
<type>(<scope>): <subject>
```

type 类型：
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

### 分支管理

- main: 主分支，用于生产环境
- develop: 开发分支
- feature/*: 特性分支
- hotfix/*: 紧急修复分支

## 📚 文档

- [React 文档](https://react.dev)
- [Vite 文档](https://vitejs.dev)
- [TypeScript 文档](https://www.typescriptlang.org)
- [Ant Design Mobile 文档](https://mobile.ant.design)
- [ECharts 文档](https://echarts.apache.org)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 鸣谢

感谢所有为本项目做出贡献的开发者！

---

<div align="center">

如果这个项目对你有帮助，请给一个 ⭐️ Star ⭐️

</div>
