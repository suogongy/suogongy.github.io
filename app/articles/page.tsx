import { getArticlesPaginated } from '@/lib/content'
import ArticleCard from '@/components/ArticleCard'
import StaticPagination from '@/components/StaticPagination'

export default async function ArticlesPage() {
  const pagination = await getArticlesPaginated('articles', 1, 4)

  return (
    <section className="section">
      <h2 className="section-title">随笔</h2>
      <div className="articles-list">
        {pagination.articles.length > 0 ? (
          pagination.articles.map((article, index) => (
            <ArticleCard
              key={`${article.name}-page1-${index}`}
              article={article}
              category="随笔"
            />
          ))
        ) : (
          <div className="card">
            暂无随笔，请在 content/articles/ 目录下添加 Markdown 文件。
          </div>
        )}
      </div>

      <StaticPagination pagination={pagination} baseUrl="/articles" />
    </section>
  )
}