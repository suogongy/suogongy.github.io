import { getArticlesPaginated } from '@/lib/content'
import ArticleCard from '@/components/ArticleCard'
import StaticPagination from '@/components/StaticPagination'
import Link from 'next/link'

export default async function NotesPage2() {
  const pagination = await getArticlesPaginated('notes', 4, 10)

  return (
    <section className="section">
      <h2 className="section-title">笔记 - 第 4 页</h2>
      <div className="articles-list">
        {pagination.articles.length > 0 ? (
          pagination.articles.map((article, index) => (
            <ArticleCard
              key={`${article.name}-page2-${index}`}
              article={article}
              category="笔记"
            />
          ))
        ) : (
          <div className="card">
            暂无更多笔记。
          </div>
        )}
      </div>

      <StaticPagination pagination={pagination} baseUrl="/notes" />
    </section>
  )
}