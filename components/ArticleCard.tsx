import Link from 'next/link'
import { Article } from '@/lib/content'

interface ArticleCardProps {
  article: Article
  category: string
}

export default function ArticleCard({ article, category }: ArticleCardProps) {
  // 根据category确定正确的路径
  const getCategoryPath = (category: string) => {
    switch (category) {
      case '笔记':
        return 'notes'
      case '随笔':
        return 'articles'
      default:
        return category
    }
  }

  const categoryPath = getCategoryPath(category)
  const articleSlug = article.name.replace('.md', '')

  return (
    <Link href={`/${categoryPath}/${articleSlug}`} className="article-card-link">
      <div className="article-card">
        <h3 className="article-title">{article.title}</h3>
        <div className="article-meta">
          {`${article.date || '2024-01-01'} • ${category}`}
        </div>
        <p className="article-excerpt">
          {article.excerpt || article.description}
        </p>
      </div>
    </Link>
  )
}