# GitHub Pages 自动部署设置指南

本指南将帮助你设置 GitHub Actions 自动部署 Next.js 项目到 GitHub Pages。

## 🎯 前提条件

- 你已经拥有一个 GitHub 仓库
- 项目已经配置了 Next.js 和 GitHub Actions
- 仓库名称：`suogongy.github.io`（用户仓库格式）

## 📋 设置步骤

### 1. 启用 GitHub Actions

1. **打开仓库设置**
   - 进入你的 GitHub 仓库
   - 点击右上角的 "Settings" 标签页

2. **配置 GitHub Pages**
   - 在左侧菜单中找到 "Pages"
   - 在 "Source" 部分选择 "GitHub Actions"
   - 系统会显示 "Your site is ready to be published from GitHub Actions"

### 2. 推送代码触发部署

推送你的最新代码到 `main` 分支：

```bash
git add .
git commit -m "配置GitHub Actions自动部署"
git push origin main
```

### 3. 监控部署过程

1. **查看 Actions 运行状态**
   - 进入仓库的 "Actions" 标签页
   - 点击 "Deploy to GitHub Pages and Vercel" 工作流
   - 查看部署进度和日志

2. **部署完成后**
   - 成功部署后，你会在 Actions 页面看到绿色的 ✅ 标记
   - 进入 Settings → Pages 查看部署的网站链接

## 🔧 配置说明

### GitHub Actions 工作流程

你的项目已经配置了完整的自动部署流程（`.github/workflows/deploy.yml`）：

```yaml
name: Deploy to GitHub Pages and Vercel

on:
  push:
    branches: [ main ]  # 推送到main分支时触发
  pull_request:
    branches: [ main ]  # PR到main分支时触发预览部署

jobs:
  deploy-github-pages:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
      - name: Setup Node.js
      - name: Install dependencies
      - name: Build project
      - name: Deploy to GitHub Pages
```

### Next.js 配置

项目已经配置为静态站点生成（`next.config.js`）：

- `output: 'export'` - 启用静态导出
- `trailingSlash: true` - 添加尾部斜杠
- `distDir: 'out'` - 输出目录
- `images: { unoptimized: true }` - 禁用图片优化（静态部署需要）

## 🎉 部署完成后

### 访问你的网站

部署成功后，你的网站将在以下地址可用：

- **主站**：`https://suogongy.github.io`
- **自定义域名**：如果配置了 CNAME 文件

### 自动更新

每次推送代码到 `main` 分支时，GitHub Actions 会自动：

1. 构建你的 Next.js 应用
2. 部署到 GitHub Pages
3. （可选）同时部署到 Vercel

## 🛠️ 故障排除

### 常见问题

#### 1. 构建失败
- **检查错误日志**：进入 Actions → 点击失败的运行 → 查看错误信息
- **常见原因**：依赖问题、TypeScript 错误、构建配置问题

#### 2. 部署成功但页面空白
- **检查路径配置**：确保 `next.config.js` 中的路径设置正确
- **检查输出目录**：确认 `out` 目录包含所有必要文件

#### 3. 样式加载失败
- **检查 CSS 配置**：确保 CSS 文件正确引入
- **检查静态资源**：确认图片、字体等资源路径正确

### 调试技巧

1. **本地测试构建**：
   ```bash
   npm run build
   npm run start
   ```

2. **检查构建输出**：
   ```bash
   ls -la out/
   ```

3. **查看详细日志**：
   - 在 Actions 页面点击具体的工作流运行
   - 展开各个步骤查看详细输出

## 📝 高级配置

### 自定义域名

1. **创建 CNAME 文件**：
   ```bash
   echo "yourdomain.com" > public/CNAME
   git add public/CNAME
   git commit -m "添加自定义域名"
   git push origin main
   ```

2. **配置 DNS**：
   - 登录你的域名提供商
   - 添加 CNAME 记录指向 `suogongy.github.io`

### 环境变量

如果你的项目需要环境变量：

1. **进入仓库设置**：
   - Settings → Secrets and variables → Actions

2. **添加环境变量**：
   - 点击 "New repository secret"
   - 添加你的环境变量

### 部署分支

默认部署到 `main` 分支，如需修改：

1. **编辑工作流文件**：
   ```yaml
   on:
     push:
       branches: [ your-branch-name ]
   ```

2. **更新 Pages 设置**：
   - Settings → Pages → 选择正确的分支

## 🚀 下一步

部署成功后，你可以：

1. **自定义网站内容**：编辑 `content/` 目录下的文件
2. **修改样式**：编辑 `app/globals.css`
3. **添加新功能**：创建新的 React 组件
4. **优化 SEO**：编辑 `app/layout.tsx` 的元数据

## 📞 获取帮助

如果遇到问题：

1. **查看 GitHub 文档**：https://docs.github.com/en/pages
2. **检查 Next.js 文档**：https://nextjs.org/docs
3. **提交 Issue**：在项目仓库创建 Issue

---

**🎊 恭喜！你的个人网站现在可以自动部署到 GitHub Pages 了！**