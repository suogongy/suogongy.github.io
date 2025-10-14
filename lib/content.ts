import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import hljs from 'highlight.js'
import matter from 'gray-matter'

// 配置 marked 以支持代码高亮
marked.setOptions({
  highlight: function(code: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

export interface SocialLink {
  name: string
  icon: string
  url: string
}

export interface SiteConfig {
  name: string
  bio: string
  social: SocialLink[]
}

export interface Project {
  title: string
  description: string
  tags: string[]
  icon?: string
  demoUrl?: string
  githubUrl?: string
  features?: string[]
  slug?: string
  content?: string
}

export interface Article {
  name: string
  title: string
  date: string
  excerpt?: string
  tags?: string[]
  content?: string
  rawContent?: string
}

export interface PaginationResult {
  articles: Article[]
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// 获取站点配置
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const configPath = path.join(process.cwd(), 'content', 'config.json')
    const configData = fs.readFileSync(configPath, 'utf8')
    return JSON.parse(configData)
  } catch (error) {
    console.warn('Could not load config, using default values')
    return {
      name: 'Your Name',
      bio: '全栈开发工程师 | 开源爱好者 | 终身学习者',
      social: [
        { name: 'github', icon: 'fab fa-github', url: 'https://github.com/yourusername' },
        { name: 'twitter', icon: 'fab fa-twitter', url: 'https://twitter.com/yourusername' },
        { name: 'linkedin', icon: 'fab fa-linkedin', url: 'https://linkedin.com/in/yourusername' },
        { name: 'email', icon: 'fas fa-envelope', url: 'mailto:your.email@example.com' }
      ]
    }
  }
}

// 获取关于页面的 Markdown 内容
export async function getAboutContent(): Promise<string> {
  try {
    const aboutPath = path.join(process.cwd(), 'content', 'about.md')
    const aboutContent = fs.readFileSync(aboutPath, 'utf8')
    return marked.parse(aboutContent)
  } catch (error) {
    console.warn('Could not load about.md, using default content')
    return marked.parse('## 关于我\n\n欢迎来到我的个人主页！这里是我的个人简介。')
  }
}

// 获取项目列表
export async function getProjects(): Promise<Project[]> {
  try {
    const projectsPath = path.join(process.cwd(), 'content', 'projects', 'index.json')
    const projectsData = fs.readFileSync(projectsPath, 'utf8')
    return JSON.parse(projectsData)
  } catch (error) {
    console.warn('Could not load projects, using default data')
    return [
      {
        title: 'React 个人博客',
        description: '使用 React 构建的现代化个人博客系统，支持 Markdown 渲染和响应式设计。',
        tags: ['React', 'JavaScript', 'CSS'],
        icon: 'fas fa-blog',
        demoUrl: '#',
        githubUrl: '#'
      },
      {
        title: '数据可视化工具',
        description: '基于 D3.js 的交互式数据可视化平台，支持多种图表类型和实时数据更新。',
        tags: ['D3.js', 'JavaScript', 'SVG'],
        icon: 'fas fa-chart-bar',
        demoUrl: '#',
        githubUrl: '#'
      }
    ]
  }
}

// 获取单个项目内容
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    // 首先尝试从 Markdown 文件加载
    const projectPath = path.join(process.cwd(), 'content', 'projects', `${slug}.md`)
    const fileContent = fs.readFileSync(projectPath, 'utf8')
    const { data, content } = matter(fileContent)

    return {
      title: data.title || slug,
      description: data.description || '',
      tags: data.tags || [],
      icon: data.icon || 'fas fa-code',
      demoUrl: data.demoUrl || '',
      githubUrl: data.githubUrl || '',
      features: data.features || [],
      slug: slug,
      content: content
    }
  } catch (error) {
    console.error(`Could not load project ${slug}:`, error)
    return null
  }
}

// 获取文章列表
export async function getArticles(category: 'notes' | 'articles'): Promise<Article[]> {
  try {
    const indexPath = path.join(process.cwd(), 'content', category, 'index.json')
    const indexData = fs.readFileSync(indexPath, 'utf8')
    return JSON.parse(indexData)
  } catch (error) {
    console.warn(`Could not load ${category} index, using empty array`)
    return []
  }
}

// 获取分页文章列表
export async function getArticlesPaginated(
  category: 'notes' | 'articles',
  page: number = 1,
  limit: number = 6
): Promise<PaginationResult> {
  try {
    const articles = await getArticles(category)
    const totalItems = articles.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    // 确保页码在有效范围内
    const validPage = Math.max(1, Math.min(page, totalPages || 1))
    const validStartIndex = (validPage - 1) * limit
    const validEndIndex = validStartIndex + limit

    const paginatedArticles = articles.slice(validStartIndex, validEndIndex)

    return {
      articles: paginatedArticles,
      currentPage: validPage,
      totalPages,
      totalItems,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1
    }
  } catch (error) {
    console.error(`Error getting paginated articles for ${category}:`, error)
    return {
      articles: [],
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
  }
}

// 获取单篇文章内容
export async function getArticle(category: 'notes' | 'articles', fileName: string): Promise<Article | null> {
  try {
    const articlePath = path.join(process.cwd(), 'content', category, fileName)
    const fileContent = fs.readFileSync(articlePath, 'utf8')
    const { data, content } = matter(fileContent)
    
    return {
      name: fileName,
      title: data.title || fileName,
      date: data.date || new Date().toISOString().split('T')[0],
      excerpt: data.excerpt || content.slice(0, 150) + '...',
      tags: data.tags || [],
      content: marked.parse(content),
      rawContent: content // 保留原始Markdown内容用于客户端渲染
    }
  } catch (error) {
    console.error(`Could not load article ${fileName}:`, error)
    return null
  }
}

// 生成所有静态路径
export async function generateStaticPaths() {
  const notes = await getArticles('notes')
  const articles = await getArticles('articles')
  
  return [
    ...notes.map(note => ({ params: { category: 'notes', slug: note.name.replace('.md', '') } })),
    ...articles.map(article => ({ params: { category: 'articles', slug: article.name.replace('.md', '') } }))
  ]
}