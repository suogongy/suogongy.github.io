import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticle, getArticles } from '@/lib/content'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import type { Metadata } from 'next'

interface ArticlePageProps {
  params: {
    category: string
    slug: string
  }
}

// 生成静态路径
export async function generateStaticParams() {
  const articles: { category: string; slug: string }[] = []
  
  // 获取笔记
  const notes = await getArticles('notes')
  notes.forEach(note => {
    articles.push({
      category: 'notes',
      slug: note.name.replace('.md', '')
    })
  })
  
  // 获取随笔
  const articlesList = await getArticles('articles')
  articlesList.forEach(article => {
    articles.push({
      category: 'articles',
      slug: article.name.replace('.md', '')
    })
  })
  
  return articles
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const fileName = `${params.slug}.md`
  const article = await getArticle(params.category as 'notes' | 'articles', fileName)

  if (!article) {
    notFound()
  }

  const categoryTitle = params.category === 'notes' ? '笔记' : '随笔'

  return (
    <div>
      <Link 
        href={`/${params.category}`}
        className="back-button"
        style={{
          display: 'inline-block',
          background: 'var(--primary-color)',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '20px',
          textDecoration: 'none'
        }}
      >
        ← 返回{categoryTitle}列表
      </Link>
      
      <article className="section">
        <header className="article-header">
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                {article.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="card markdown-content">
          {article.rawContent && <MarkdownRenderer content={article.rawContent} />}
        </div>
      </article>
    </div>
  )
}

// 生成页面元数据
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const fileName = `${params.slug}.md`
  const article = await getArticle(params.category as 'notes' | 'articles', fileName)
  
  if (!article) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: `${article.title} - Personal GitHub Page`,
    description: article.excerpt,
  }
}