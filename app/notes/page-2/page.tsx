import { getArticlesPaginated } from '@/lib/content'
import ArticleCard from '@/components/ArticleCard'
import StaticPagination from '@/components/StaticPagination'
import Link from 'next/link'

export default async function NotesPage2() {
  const pagination = await getArticlesPaginated('notes', 2, 6)

  return (
    <section className="section">
      <h2 className="section-title">技术笔记 - 第 2 页</h2>
      <div className="articles-list">
        {pagination.articles.length > 0 ? (
          pagination.articles.map((article, index) => (
            <ArticleCard
              key={`${article.name}-page2-${index}`}
              article={article}
              category="技术笔记"
            />
          ))
        ) : (
          <div className="card">
            暂无更多技术笔记。
          </div>
        )}
      </div>

      <StaticPagination pagination={pagination} baseUrl="/notes" />
    </section>
  )
}