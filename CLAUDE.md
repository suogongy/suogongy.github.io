# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

这是一个基于 Next.js 14 构建的现代化个人 GitHub Pages 网站，具有以下特性：
- 静态站点生成 (SSG) 以获得最佳性能
- 响应式设计，支持暗色/亮色主题
- 基于 Markdown 的内容管理系统
- 双平台部署支持（GitHub Pages + Vercel）
- TypeScript 类型安全
- 中文界面

## 开发命令

```bash
# 开发环境
npm run dev              # 启动开发服务器 (localhost:3000)
npm run build            # 构建生产版本
npm run start            # 启动生产服务器
npm run lint             # 运行 ESLint

# 部署
npm run deploy:vercel    # 部署到 Vercel
npm run deploy:github    # 手动部署到 GitHub Pages
```

## 架构与核心概念

### 内容管理系统
- **内容目录**: 所有内容存储在 `/content/` 目录中
- **配置文件**: `content/config.json` - 网站设置、个人信息、社交链接
- **文章**: 两个分类 - `content/notes/` (技术笔记) 和 `content/articles/` (随笔)
- **项目**: `content/projects/_index.json` - 项目展示数据
- **关于页面**: `content/about.md` - 个人简介的 Markdown 文件

### 数据加载模式
- 所有内容加载由 `lib/content.ts` 处理
- 使用 Next.js App Router 的基于文件的路由
- 构建时静态生成以提高性能
- Markdown 内容通过 `marked.js` 和 `highlight.js` 处理语法高亮
- 使用 `gray-matter` 解析前置元数据

### 核心组件结构
- `Navigation.tsx` - 网站导航和社交链接
- `HeroSection.tsx` - 首页英雄区域和个人信息
- `ProjectCard.tsx` - 项目展示卡片
- `ArticleCard.tsx` - 文章/列表项卡片
- `MarkdownRenderer.tsx` - 客户端 Markdown 渲染和语法高亮
- `Pagination.tsx` - 文章分页
- `MarkmapRenderer.tsx` - 结构化内容的思维导图渲染
- `Mermaid.tsx` - 图表渲染支持

### 路由结构
```
/                    # 首页
/about               # 关于页面
/projects            # 项目展示
/notes               # 技术笔记（分页）
/articles            # 个人随笔（分页）
/notes/[slug]        # 单个笔记页面
/articles/[slug]     # 单个随笔页面
```

## 内容管理工作流

### 添加新文章
1. 更新索引文件（`content/notes/_index.json` 或 `content/articles/_index.json`）
2. 在同一目录中创建对应的 `.md` 文件
3. 使用前置元数据（title, excerpt, tags, date）

### 添加项目
1. 使用项目数据更新 `content/projects/_index.json`
2. 包含标题、描述、标签、图标、演示/GitHub 链接
3. 可选：创建详细的项目页面作为 Markdown 文件

### 网站配置
- 编辑 `content/config.json` 设置个人信息
- 社交链接使用 Font Awesome 图标类
- 重新构建后更改自动生效

## 部署配置

### GitHub Pages（主要）
- 通过 GitHub Actions 在推送到 master 分支时自动部署
- 工作流：`.github/workflows/deploy.yml`
- 静态导出到 `out/` 目录
- 使用 Next.js 静态导出模式（`output: 'export'`）
- 添加 `.nojekyll` 文件以确保正确的静态托管

### Vercel（备选）
- 配置在 `vercel.json` 中
- 香港地区的静态站点生成
- 构建命令：`npm run build`
- 输出目录：`out/`

## 技术栈详情

### 核心依赖
- **Next.js 14** - 带有 App Router 的 React 框架
- **TypeScript** - 类型安全（配置为宽松设置）
- **marked.js** - Markdown 解析
- **highlight.js** - 代码语法高亮
- **gray-matter** - 前置元数据解析
- **date-fns** - 日期格式化

### 外部依赖（CDN）
- Font Awesome 6.0.0 - 图标
- Highlight.js GitHub 主题 - 代码高亮样式
- Mermaid.js - 图表渲染
- Markmap - 思维导图渲染

### Next.js 配置
- 静态导出模式（`output: 'export'`）
- 为静态托管禁用图片优化
- 忽略 TypeScript/ESLint 构建错误
- 一致的构建 ID 生成
- 启用尾部斜杠

## 文件结构模式

### 内容文件
- 索引文件使用 `_index.json` 命名约定
- Markdown 文件使用 `.md` 扩展名
- 文章需要前置元数据（title, date, excerpt, tags）

### 组件组织
- 所有组件在 `/components/` 目录中
- 使用 TypeScript 和 React 函数组件
- CSS 模块和全局 CSS 变量用于样式

### 路径别名
- `@/` → 根目录
- `@/components/` → 组件目录
- `@/lib/` → 库目录

## 开发注意事项

### 样式方法
- 使用 CSS 自定义属性（变量）进行主题化
- 移动优先的响应式设计
- 自动暗色/亮色主题切换
- 全局样式在 `app/globals.css` 中

### 内容渲染
- 初始内容的服务器端 Markdown 解析
- 交互功能的客户端渲染（Mermaid, Markmap）
- 代码块语法高亮
- 支持 GitHub Flavored Markdown (GFM)

### 构建过程
- 构建时静态站点生成
- 所有路由预渲染为 HTML 文件
- 为 GitHub Pages 静态托管优化
- 宽松设置的 TypeScript 编译