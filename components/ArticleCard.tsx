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
        <p className="article-excerpt">
          {article.excerpt}
        </p>
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
    </Link>
  )
}