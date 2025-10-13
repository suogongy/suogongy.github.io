import { getArticles } from '@/lib/content'
import ArticleCard from '@/components/ArticleCard'
import Link from 'next/link'

export default async function NotesPage() {
  const articles = await getArticles('notes')

  return (
    <section className="section">
      <h2 className="section-title">技术笔记</h2>
      <div className="articles-list">
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <ArticleCard
              key={index}
              article={article}
              category="技术笔记"
            />
          ))
        ) : (
          <div className="card">
            暂无技术笔记，请在 content/notes/ 目录下添加 Markdown 文件。
          </div>
        )}
      </div>
    </section>
  )
}