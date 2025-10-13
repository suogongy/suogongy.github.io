import { getAboutContent } from '@/lib/content'

export default async function AboutPage() {
  const content = await getAboutContent()

  return (
    <section className="section">
      <h2 className="section-title">关于我</h2>
      <div 
        className="card markdown-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  )
}