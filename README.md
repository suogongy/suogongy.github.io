# 个人 GitHub Page (Next.js 版本)

一个现代化的个人 GitHub Pages 网站，基于 Next.js 14 构建，具有响应式设计和极客风格的美观界面。支持 GitHub Pages 和 Vercel 双平台部署。

## ✨ 特性

- 🎨 **现代化设计** - 简洁、清晰的极客风格界面
- 📱 **响应式布局** - 完美适配桌面、平板和移动设备
- ⚡ **高性能** - 基于 Next.js 14 和静态站点生成(SSG)
- 🔍 **SEO 友好** - 服务端渲染，搜索引擎友好
- 📝 **Markdown 支持** - 支持 Markdown 内容自动渲染
- 🔧 **易于配置** - 通过简单的 JSON 文件进行配置
- 🌙 **暗色模式** - 自动适配系统主题偏好
- 🚀 **双平台部署** - 支持 GitHub Pages 和 Vercel 部署
- 💎 **TypeScript** - 类型安全的开发体验

## 🚀 快速开始

### 使用模板

1. 点击页面右上角的 "Use this template" 按钮
2. 创建你的新仓库
3. 修改 `content/config.json` 文件中的个人信息
4. 根据需要选择部署平台

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/yourusername.github.io.git
cd yourusername.github.io

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看效果。

## 📁 项目结构

```
your-repo/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── about/page.tsx      # 关于页面
│   ├── projects/page.tsx   # 项目页面
│   ├── notes/page.tsx      # 笔记页面
│   ├── articles/page.tsx   # 文章页面
│   ├── [category]/[slug]/page.tsx  # 动态文章页面
│   └── globals.css         # 全局样式
├── components/             # React 组件
│   ├── Navigation.tsx      # 导航组件
│   ├── HeroSection.tsx     # 首页英雄区
│   ├── ProjectCard.tsx     # 项目卡片
│   └── ArticleCard.tsx     # 文章卡片
├── lib/                    # 工具函数
│   └── content.ts          # 内容处理函数
├── content/                # 内容目录（重要！）
│   ├── config.json         # 网站配置文件
│   ├── about.md            # 个人简介
│   ├── projects/           # 项目展示
│   │   └── index.json      # 项目数据文件
│   ├── notes/              # 技术笔记
│   │   ├── index.json      # 笔记索引文件
│   │   └── *.md            # 笔记内容文件
│   └── articles/           # 随笔文章
│       ├── index.json      # 文章索引文件
│       └── *.md            # 文章内容文件
├── public/                 # 静态资源
├── docs/                   # 文档目录
│   └── usage.md            # 详细使用指南
├── next.config.js          # Next.js 配置
├── package.json            # 项目配置和依赖
└── vercel.json             # Vercel 部署配置
```

## ⚙️ 配置说明

### 1. 修改个人信息

编辑 `content/config.json`：

```json
{
  "name": "你的名字",
  "bio": "你的个人简介，比如：全栈开发工程师 | 开源爱好者 | 终身学习者",
  "social": [
    {
      "name": "github",
      "icon": "fab fa-github",
      "url": "https://github.com/yourusername"
    }
  ]
}
```

### 2. 编辑个人简介

修改 `content/about.md` 文件，使用 Markdown 语法编写你的个人介绍。

### 3. 添加项目

编辑 `content/projects/index.json`：

```json
[
  {
    "title": "项目名称",
    "description": "项目的简短描述，说明项目的功能和特点",
    "tags": ["React", "JavaScript", "CSS"],
    "icon": "fas fa-code",
    "demoUrl": "https://demo.com",
    "githubUrl": "https://github.com/user/repo"
  }
]
```

### 4. 添加笔记和文章

在 `content/notes/` 和 `content/articles/` 目录下：
- 编辑 `index.json` 添加内容索引
- 创建对应的 `.md` 文件编写内容

## 🌐 部署

### GitHub Pages 部署

1. **自动部署**：
   - 推送代码到 GitHub 仓库
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

2. **手动部署**：
   ```bash
   npm run build
   npm run deploy:github
   ```

### Vercel 部署

1. **通过 Vercel 仪表板**：
   - 连接你的 GitHub 仓库
   - Vercel 会自动检测 Next.js 项目
   - 点击部署即可

2. **通过 CLI**：
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **自动部署**：
   - 设置环境变量（在 GitHub 仓库的 Settings → Secrets）
   - `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID`
   - 推送代码自动触发部署

## 🎨 自定义

### 修改主题色彩

编辑 `app/globals.css` 中的 CSS 变量：

```css
:root {
    --primary-color: #0066cc;
    --accent-color: #00ffcc;
    /* 其他颜色变量 */
}
```

### 自定义域名

1. **GitHub Pages**：
   - 在仓库根目录创建 `CNAME` 文件
   - 内容为你的域名

2. **Vercel**：
   - 在 Vercel 仪表板的项目设置中添加域名

## 🛠️ 开发命令

```bash
# 开发环境
npm run dev          # 启动开发服务器 (localhost:3000)

# 构建和部署
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 代码检查
npm run lint         # 运行 ESLint

# 部署命令
npm run deploy:vercel   # 部署到 Vercel
npm run deploy:github   # 部署到 GitHub Pages
```

## 🔧 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: CSS3 + CSS Variables
- **Markdown**: marked.js + highlight.js
- **图标**: Font Awesome
- **构建**: Next.js SSG (Static Site Generation)

## 📈 性能优化

- ✅ 静态站点生成 (SSG)
- ✅ 自动代码分割
- ✅ 图片优化 (Next.js Image)
- ✅ 字体优化
- ✅ CSS 优化
- ✅ 缓存策略

## 🚀 迁移指南

如果你是从旧版本（原生 React）迁移：

1. **依赖变化**：添加了 Next.js、TypeScript 等依赖
2. **目录结构**：采用 Next.js App Router 结构
3. **数据获取**：改为构建时生成，提高性能
4. **路由系统**：从状态管理改为真正的路由

## 📖 详细文档

查看 [docs/usage.md](docs/usage.md) 获取完整的使用指南。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有开源项目的贡献者，特别是：
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [marked.js](https://marked.js.org/)
- [highlight.js](https://highlightjs.org/)
- [Font Awesome](https://fontawesome.com/)

---

**如果这个项目对你有帮助，请给个 ⭐ Star！**