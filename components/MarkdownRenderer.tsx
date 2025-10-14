'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { marked } from 'marked'
import Mermaid from './Mermaid'
import hljs from 'highlight.js'

interface MarkdownRendererProps {
  content: string
}

interface MermaidBlock {
  id: string
  chart: string
  position: number
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 配置marked以支持代码高亮
  marked.setOptions({
    highlight: function(code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return hljs.highlightAuto(code).value
    },
    breaks: true,
    gfm: true
  })

  // 处理Markdown内容，保留Mermaid位置信息
  const { processedParts, mermaidBlocks } = useMemo(() => {
    const mermaidBlocks: MermaidBlock[] = []
    let position = 0

    // 分割内容，保留Mermaid代码块的位置
    const parts = content.split(/(```mermaid\n[\s\S]*?```)/g)

    const processedParts = parts.map((part) => {
      const mermaidMatch = part.match(/```mermaid\n([\s\S]*?)```/)
      if (mermaidMatch) {
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`
        const chart = mermaidMatch[1].trim()
        mermaidBlocks.push({ id, chart, position })
        position++
        return { type: 'mermaid', id, chart }
      } else if (part.trim()) {
        // 处理普通Markdown内容
        const htmlContent = marked.parse(part)
        return { type: 'html', content: htmlContent }
      }
      return null
    }).filter(Boolean)

    return { processedParts, mermaidBlocks }
  }, [content])

  // 渲染处理后的内容
  const renderContent = () => {
    return processedParts.map((part, index) => {
      if (part && part.type === 'html') {
        return (
          <div
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        )
      } else if (part && part.type === 'mermaid') {
        return <Mermaid key={part.id} chart={part.chart} id={part.id} />
      }
      return null
    })
  }

  return (
    <div className="markdown-content" ref={containerRef}>
      {renderContent()}
    </div>
  )
}