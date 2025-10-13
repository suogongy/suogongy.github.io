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

// GitHub Pages 部署时需要设置路径前缀
// 如果你的仓库名不是 username.github.io，请修改下面的路径
if (process.env.NODE_ENV === 'production') {
  nextConfig.assetPrefix = '/yourusername.github.io'
  nextConfig.basePath = '/yourusername.github.io'
}

module.exports = nextConfig