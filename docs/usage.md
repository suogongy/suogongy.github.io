# Next.js 个人 GitHub Page 使用指南

这是一个基于 Next.js 14 构建的现代化个人 GitHub Pages 网站，支持响应式设计，具有极客风格的美观界面。

## 📁 项目结构详解

```
your-repo/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # 根布局文件
│   ├── page.tsx            # 首页 (/)
│   ├── about/page.tsx      # 关于页面 (/about)
│   ├── projects/page.tsx   # 项目页面 (/projects)
│   ├── notes/page.tsx      # 笔记页面 (/notes)
│   ├── articles/page.tsx   # 文章页面 (/articles)
│   ├── [category]/[slug]/page.tsx  # 动态文章页面
│   └── globals.css         # 全局样式文件
├── components/             # React 组件目录
│   ├── Navigation.tsx      # 导航栏组件
│   ├── HeroSection.tsx     # 首页英雄区域
│   ├── ProjectCard.tsx     # 项目展示卡片
│   └── ArticleCard.tsx     # 文章列表卡片
├── lib/                    # 工具函数库
│   └── content.ts          # 内容处理和数据获取
├── content/                # 内容目录（主要编辑区域）
│   ├── config.json         # 网站全局配置
│   ├── about.md            # 个人简介内容
│   ├── projects/           # 项目展示数据
│   ├── notes/              # 技术笔记内容
│   └── articles/           # 随笔文章内容
├── public/                 # 静态资源目录
├── next.config.js          # Next.js 配置文件
├── vercel.json             # Vercel 部署配置
└── package.json            # 项目依赖配置
```

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装和运行

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/yourusername.github.io.git
cd yourusername.github.io

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看网站效果。

### 可用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 代码检查
npm run deploy:vercel   # 部署到 Vercel
npm run deploy:github   # 部署到 GitHub Pages
```

## ⚙️ 详细配置指南

### 1. 个人信息配置

编辑 `content/config.json` 文件：

```json
{
  "name": "你的名字",
  "bio": "你的个人简介，建议简洁有力地描述自己",
  "social": [
    {
      "name": "github",
      "icon": "fab fa-github",
      "url": "https://github.com/yourusername"
    },
    {
      "name": "twitter",
      "icon": "fab fa-twitter", 
      "url": "https://twitter.com/yourusername"
    },
    {
      "name": "linkedin",
      "icon": "fab fa-linkedin",
      "url": "https://linkedin.com/in/yourusername"
    },
    {
      "name": "email",
      "icon": "fas fa-envelope",
      "url": "mailto:your.email@example.com"
    }
  ]
}
```

**注意事项**：
- `name` 将显示在网站标题和导航栏
- `bio` 是个人简介，显示在首页
- `social` 数组中的链接会显示在首页社交区域

### 2. 个人简介编辑

修改 `content/about.md` 文件，使用标准 Markdown 语法：

```markdown
# 关于我

## 个人简介
我是一名充满热情的全栈开发工程师...

## 技能专长
### 前端开发
- **JavaScript/TypeScript**: 精通现代 JavaScript 和 TypeScript
- **React**: 深入理解 React 生态系统
- **Vue**: 熟练使用 Vue 3 进行开发
- **CSS/Sass**: 掌握现代 CSS 技术

### 后端开发
- **Node.js**: 使用 Express 构建 RESTful API
- **Python**: 熟悉 Django、Flask 框架
- **数据库**: MySQL、PostgreSQL、MongoDB

## 工作经历
### 高级前端工程师 (2022 - 至今)
- 负责公司核心产品的前端架构设计
- 带领团队完成多个重要项目

## 教育背景
**计算机科学与技术学士学位**
- 某某大学 (2016 - 2020)

## 联系方式
如果你愿意交流技术或合作，欢迎联系我！
```

### 3. 项目展示配置

编辑 `content/projects/index.json` 文件：

```json
[
  {
    "title": "项目名称",
    "description": "详细描述项目的功能、特点和使用的技术栈",
    "tags": ["React", "TypeScript", "Node.js", "MongoDB"],
    "icon": "fas fa-code",
    "demoUrl": "https://project-demo.com",
    "githubUrl": "https://github.com/yourusername/project",
    "features": [
      "功能特点1",
      "功能特点2", 
      "功能特点3"
    ]
  },
  {
    "title": "另一个项目",
    "description": "项目描述...",
    "tags": ["Vue", "JavaScript", "CSS"],
    "icon": "fas fa-mobile-alt",
    "demoUrl": "https://another-demo.com",
    "githubUrl": "https://github.com/yourusername/another-project"
  }
]
```

**字段说明**：
- `title`: 项目标题
- `description`: 项目详细描述
- `tags`: 技术标签数组
- `icon`: Font Awesome 图标类名
- `demoUrl`: 项目演示链接（可选）
- `githubUrl`: GitHub 仓库链接（可选）
- `features`: 项目特点列表（可选）

### 4. 技术笔记配置

#### 4.1 编辑索引文件

修改 `content/notes/index.json`：

```json
[
  {
    "name": "react-hooks-guide.md",
    "title": "React Hooks 完全指南",
    "date": "2024-01-15",
    "excerpt": "深入解析 React Hooks 的使用方法和最佳实践",
    "tags": ["React", "JavaScript", "前端"]
  },
  {
    "name": "typescript-advanced-types.md", 
    "title": "TypeScript 高级类型系统",
    "date": "2024-01-10",
    "excerpt": "深入理解 TypeScript 的高级类型和泛型编程",
    "tags": ["TypeScript", "类型系统", "前端"]
  }
]
```

#### 4.2 创建笔记内容

创建对应的 Markdown 文件，如 `content/notes/react-hooks-guide.md`：

```markdown
---
title: "React Hooks 完全指南"
date: "2024-01-15"
excerpt: "深入解析 React Hooks 的使用方法和最佳实践"
tags: ["React", "JavaScript", "前端"]
---

# React Hooks 完全指南

React Hooks 是 React 16.8 引入的新特性...

## 目录

1. [Hooks 简介](#hooks-简介)
2. [基本 Hooks](#基本-hooks)
3. [自定义 Hooks](#自定义-hooks)

## Hooks 简介

Hooks 是一些可以让你在函数组件里"钩入" React state 及生命周期等特性的函数...

## 代码示例

```javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## 总结

掌握 Hooks 需要理解其工作原理和遵循使用规则...
```

### 5. 随笔文章配置

随笔的配置方式与技术笔记相同，操作 `content/articles/` 目录即可：

#### 5.1 编辑索引

`content/articles/index.json`：
```json
[
  {
    "name": "my-programming-journey.md",
    "title": "我的编程之路",
    "date": "2024-01-20", 
    "excerpt": "回顾从零基础到成为全栈开发者的成长历程",
    "tags": ["成长", "回顾", "思考"]
  }
]
```

#### 5.2 创建文章内容

`content/articles/my-programming-journey.md`：
```markdown
---
title: "我的编程之路"
date: "2024-01-20"
excerpt: "回顾从零基础到成为全栈开发者的成长历程"
tags: ["成长", "回顾", "思考"]
---

# 我的编程之路

> 每一行代码都是成长的见证

## 缘起

2016年的夏天，我第一次接触到了编程...
```

## 🎨 样式自定义

### 修改主题色彩

编辑 `app/globals.css` 文件中的 CSS 变量：

```css
:root {
    --primary-color: #0066cc;      /* 主色调 */
    --secondary-color: #1a1a2e;    /* 次要颜色 */
    --accent-color: #00ffcc;       /* 强调色 */
    --text-color: #333;            /* 文字颜色 */
    --text-secondary: #666;        /* 次要文字颜色 */
    --bg-color: #ffffff;           /* 背景色 */
    --bg-secondary: #f8f9fa;       /* 卡片背景色 */
    --border-color: #e0e0e0;       /* 边框色 */
    --card-shadow: 0 2px 10px rgba(0,0,0,0.1);  /* 卡片阴影 */
}
```

### 暗色模式适配

网站自动支持暗色模式，系统会根据用户设置自动切换。你也可以手动修改暗色模式的颜色：

```css
@media (prefers-color-scheme: dark) {
    :root {
        --text-color: #e0e0e0;
        --text-secondary: #b0b0b0;
        --bg-color: #121212;
        --bg-secondary: #1e1e1e;
        --border-color: #333;
        --card-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
}
```

## 🌐 部署指南

### GitHub Pages 部署

#### 方法一：自动部署（推荐）

1. **启用 GitHub Actions**：
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

2. **推送代码触发部署**：
   ```bash
   git add .
   git commit -m "Update website"
   git push origin main
   ```

#### 方法二：手动部署

```bash
# 构建项目
npm run build

# 部署到 GitHub Pages
npm run deploy:github
```

### Vercel 部署

#### 方法一：通过 Vercel 仪表板

1. 访问 [vercel.com](https://vercel.com)
2. 连接你的 GitHub 仓库
3. Vercel 会自动检测 Next.js 项目
4. 点击部署即可

#### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

#### 方法三：自动部署

1. **设置环境变量**（在 GitHub 仓库）：
   - `VERCEL_TOKEN`: Vercel API Token
   - `VERCEL_ORG_ID`: Vercel 组织 ID
   - `VERCEL_PROJECT_ID`: Vercel 项目 ID

2. **推送代码自动部署**：
   ```bash
   git push origin main
   ```

### 自定义域名配置

#### GitHub Pages

1. 在仓库根目录创建 `CNAME` 文件：
   ```
   yourdomain.com
   ```

2. 在域名提供商处配置 DNS：
   - CNAME 记录：`www` → `yourusername.github.io`
   - A 记录：`@` → GitHub Pages IP 地址

#### Vercel

1. 在 Vercel 项目设置中添加域名
2. 按提示配置 DNS 记录

## 🔧 开发技巧

### 1. 热重载

开发模式下支持热重载，修改代码后浏览器会自动刷新。

### 2. TypeScript 支持

项目完全支持 TypeScript，享受类型安全和代码提示。

### 3. 代码格式化

建议安装 ESLint 和 Prettier 扩展来保持代码风格一致。

### 4. 图片优化

对于图片资源，建议使用 Next.js 的 Image 组件：

```tsx
import Image from 'next/image'

<Image 
  src="/path/to/image.jpg"
  alt="描述"
  width={500}
  height={300}
/>
```

## 📱 响应式设计

网站完全响应式，支持：

- 🖥️ 桌面设备 (>768px)
- 📱 移动设备 (≤768px)
- 🌙 暗色/亮色主题自动切换

## 🔍 SEO 优化

- ✅ 静态站点生成 (SSG)
- ✅ 自动生成 sitemap
- ✅ Meta 标签优化
- ✅ 语义化 HTML 结构
- ✅ 代码分割和懒加载

## 🚨 常见问题

### Q: 如何添加新的页面？

1. 在 `app/` 目录下创建新的路由文件夹
2. 添加 `page.tsx` 文件
3. 在 `components/Navigation.tsx` 中添加导航项

### Q: 如何修改网站标题？

编辑 `app/layout.tsx` 文件中的 metadata：

```tsx
export const metadata = {
  title: '你的网站标题',
  description: '网站描述',
}
```

### Q: 如何添加自定义字体？

1. 在 `app/layout.tsx` 中添加字体链接
2. 在 CSS 中定义字体变量

### Q: 如何支持多语言？

可以使用 next-intl 等国际化库来支持多语言。

### Q: 如何添加分析工具？

在 `app/layout.tsx` 的 `<head>` 中添加分析代码。

## 📚 学习资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [React 官方文档](https://react.dev)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Markdown 语法指南](https://www.markdownguide.org/)
- [Font Awesome 图标库](https://fontawesome.com/)

## 🤝 贡献指南

欢迎贡献代码！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](../LICENSE) 文件。

---

**祝你使用愉快！如果在使用过程中遇到问题，欢迎查看 Issues 或创建新的 Issue。**