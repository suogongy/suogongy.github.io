'use client'

import { useEffect, useRef } from 'react'

interface MermaidProps {
  chart: string
  id?: string
}

export default function Mermaid({ chart, id }: MermaidProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (elementRef.current && typeof window !== 'undefined') {
      const mermaid = (window as any).mermaid

      if (mermaid) {
        // 初始化Mermaid
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#2563eb',
            lineColor: '#6b7280',
            secondaryColor: '#10b981',
            tertiaryColor: '#f59e0b',
            background: '#ffffff',
            mainBkg: '#f3f4f6',
            secondBkg: '#e5e7eb',
            tertiaryBkg: '#fef3c7'
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          }
        })

        // 生成唯一ID
        const chartId = id || `mermaid-${Math.random().toString(36).substring(2, 11)}`

        // 渲染图表
        mermaid.render(chartId, chart).then((result: any) => {
          if (elementRef.current) {
            elementRef.current.innerHTML = result.svg
          }
        }).catch((error: any) => {
          console.error('Mermaid rendering error:', error)
          if (elementRef.current) {
            elementRef.current.innerHTML = `<pre class="mermaid-error">${error.message || 'Mermaid渲染失败'}</pre>`
          }
        })
      }
    }
  }, [chart, id])

  return (
    <div
      ref={elementRef}
      className="mermaid-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '1rem 0',
        overflow: 'auto'
      }}
    />
  )
}