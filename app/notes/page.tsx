import { getArticlesPaginated } from '@/lib/content'
import ArticleCard from '@/components/ArticleCard'
import StaticPagination from '@/components/StaticPagination'

export default async function NotesPage() {
  const pagination = await getArticlesPaginated('notes', 1, 10)

  return (
    <section className="section">
      <h2 className="section-title">笔记</h2>
      <div className="articles-list">
        {pagination.articles.length > 0 ? (
          pagination.articles.map((article, index) => (
            <ArticleCard
              key={`${article.name}-page1-${index}`}
              article={article}
              category="笔记"
            />
          ))
        ) : (
          <div className="card">
            暂无笔记，请在 content/notes/ 目录下添加 Markdown 文件。
          </div>
        )}
      </div>

      <StaticPagination pagination={pagination} baseUrl="/notes" />
    </section>
  )
}