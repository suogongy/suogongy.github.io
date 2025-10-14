import { getArticlesPaginated } from '@/lib/content'
import ArticleCard from '@/components/ArticleCard'
import StaticPagination from '@/components/StaticPagination'
import Link from 'next/link'

export default async function ArticlesPage2() {
  const pagination = await getArticlesPaginated('articles', 4, 10)

  return (
    <section className="section">
      <h2 className="section-title">随笔 - 第 4 页</h2>
      <div className="articles-list">
        {pagination.articles.length > 0 ? (
          pagination.articles.map((article, index) => (
            <ArticleCard
              key={`${article.name}-page2-${index}`}
              article={article}
              category="随笔"
            />
          ))
        ) : (
          <div className="card">
            暂无更多随笔。
          </div>
        )}
      </div>

      <StaticPagination pagination={pagination} baseUrl="/articles" />
    </section>
  )
}