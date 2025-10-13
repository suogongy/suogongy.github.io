/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出配置，用于 GitHub Pages 部署
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // 图片优化配置（静态导出时需要禁用优化）
  images: {
    unoptimized: true
  },
  
  // 构建优化配置
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 生成一致的构建 ID
  generateBuildId: async () => {
    return 'build'
  },
}

// GitHub Pages 部署配置
// 对于 username.github.io 格式的仓库，不需要设置路径前缀
// 如果你使用的是其他格式的仓库名（如 project-name），请取消下面的注释并修改路径
/*
if (process.env.NODE_ENV === 'production') {
  nextConfig.assetPrefix = '/repository-name'
  nextConfig.basePath = '/repository-name'
}
*/

module.exports = nextConfig