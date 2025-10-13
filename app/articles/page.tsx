import { getArticles } from '@/lib/content'
import ArticleCard from '@/components/ArticleCard'

export default async function ArticlesPage() {
  const articles = await getArticles('articles')

  return (
    <section className="section">
      <h2 className="section-title">随笔</h2>
      <div className="articles-list">
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <ArticleCard
              key={index}
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
    </section>
  )
}