import './globals.css'
import { getSiteConfig } from '@/lib/content'
import Navigation from '@/components/Navigation'

export const metadata = {
  title: 'Personal GitHub Page',
  description: 'A modern personal GitHub Page built with Next.js',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteConfig = await getSiteConfig()

  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"
          async
        ></script>
        <script
          src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"
        ></script>
        <script
          src="https://cdn.jsdelivr.net/npm/markmap-view@0.17.2/dist/browser/index.js"
        ></script>
        <script
          src="https://cdn.jsdelivr.net/npm/markmap-lib@0.17.2/dist/browser/index.js"
        ></script>
      </head>
      <body>
        <div className="app">
          <Navigation siteConfig={siteConfig} />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  )
}