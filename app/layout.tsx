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
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"
          async
        ></script>
        <script
          src="https://unpkg.com/markmap-autoloader@0.17.2"
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