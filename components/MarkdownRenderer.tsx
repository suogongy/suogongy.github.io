'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { marked } from 'marked'
import Mermaid from './Mermaid'
import MarkmapRenderer from './MarkmapRenderer'
import hljs from 'highlight.js'

interface MarkdownRendererProps {
  content: string
}

interface MermaidBlock {
  id: string
  chart: string
  position: number
}

interface MarkmapBlock {
  id: string
  content: string
  position: number
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 配置marked以支持代码高亮
  marked.setOptions({
    highlight: function(code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        const result = hljs.highlight(code, { language: lang })
        return result.value
      }
      const result = hljs.highlightAuto(code)
      return result.value
    },
    breaks: true,
    gfm: true,
    langPrefix: 'hljs language-'
  })

  // 处理Markdown内容，保留Mermaid和Markmap位置信息
  const { processedParts, mermaidBlocks, markmapBlocks } = useMemo(() => {
    const mermaidBlocks: MermaidBlock[] = []
    const markmapBlocks: MarkmapBlock[] = []
    let position = 0

    // 分割内容，保留代码块的位置
    const parts = content.split(/(```(?:mermaid|markmap)[\r\n]+[\s\S]*?```)/g)

    const processedParts = parts.map((part) => {
      const mermaidMatch = part.match(/```mermaid[\r\n]+([\s\S]*?)```/)
      if (mermaidMatch) {
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`
        const chart = mermaidMatch[1].trim()
        mermaidBlocks.push({ id, chart, position })
        position++
        return { type: 'mermaid', id, chart }
      }

      const markmapMatch = part.match(/```markmap[\r\n]+([\s\S]*?)```/)
      if (markmapMatch) {
        const id = `markmap-${Math.random().toString(36).substring(2, 11)}`
        const content = markmapMatch[1].trim()
        markmapBlocks.push({ id, content, position })
        position++
        return { type: 'markmap', id, content }
      }

      if (part.trim()) {
        // 处理普通Markdown内容
        let htmlContent = marked.parse(part)
        // 为表格添加包装器以便更好的样式控制
        htmlContent = htmlContent.replace(/<table([^>]*)>/g, (match, attrs) => {
          return `<div class="table-wrapper"><table${attrs} style="width: auto;">`
        })
        htmlContent = htmlContent.replace(/<\/table>/g, '</table></div>')
        return { type: 'html', content: htmlContent }
      }
      return null
    }).filter(Boolean)

    return { processedParts, mermaidBlocks, markmapBlocks }
  }, [content])

  // 优化表格包装器宽度
  useEffect(() => {
    if (containerRef.current) {
      const tableWrappers = containerRef.current.querySelectorAll('.table-wrapper')
      tableWrappers.forEach(wrapper => {
        const table = wrapper.querySelector('table')
        if (table && wrapper instanceof HTMLElement) {
          // 获取表格的实际宽度
          const tableWidth = table.scrollWidth
          // 设置包装器的最小宽度为表格宽度
          wrapper.style.minWidth = `${tableWidth}px`
          wrapper.style.width = 'fit-content'
          wrapper.style.width = '-moz-fit-content' // Firefox
        }
      })
    }
  }, [processedParts])

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
      } else if (part && part.type === 'markmap') {
        return <MarkmapRenderer key={part.id} content={part.content} id={part.id} />
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