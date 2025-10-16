'use client'

import { useEffect, useRef, useState } from 'react'

interface MermaidProps {
  chart: string
  id?: string
}

export default function Mermaid({ chart, id }: MermaidProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 等待Mermaid加载完成
    const checkMermaidLoaded = () => {
      if (typeof window !== 'undefined' && (window as any).mermaid) {
        setIsLoaded(true)
      } else {
        // 如果还没加载，等待一下再检查
        setTimeout(checkMermaidLoaded, 100)
      }
    }

    checkMermaidLoaded()
  }, [])

  useEffect(() => {
    if (!isLoaded || !elementRef.current) return

    const mermaid = (window as any).mermaid

    try {
      // 初始化Mermaid配置
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
          tertiaryBkg: '#fef3c7',
          primaryBorderColor: '#2563eb',
          secondaryBorderColor: '#059669',
          tertiaryBorderColor: '#d97706'
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
          padding: 20
        },
        themeCSS: `
          .node rect,
          .node circle,
          .node ellipse,
          .node polygon {
            fill: #f8fff8;
            stroke: #4caf50;
            stroke-width: 2px;
          }
          .edgePath .path {
            stroke: #6b7280;
            stroke-width: 2px;
          }
          .edgeLabel {
            background-color: #ffffff;
            color: #1f2937;
          }
          .cluster rect {
            fill: #e8f4fd;
            stroke: #2196f3;
            stroke-width: 2px;
          }
          .titleText {
            fill: #1f2937;
            font-size: 18px;
            font-weight: bold;
          }
        `
      })

      // 生成唯一ID
      const chartId = id || `mermaid-${Math.random().toString(36).substring(2, 11)}`

      // 渲染图表
      mermaid.render(chartId, chart.trim()).then((result: any) => {
        if (elementRef.current) {
          elementRef.current.innerHTML = result.svg
          setError(null)
        }
      }).catch((error: any) => {
        console.error('Mermaid rendering error:', error)
        setError(error.message || 'Mermaid渲染失败')
        if (elementRef.current) {
          elementRef.current.innerHTML = `<div class="mermaid-error" style="color: #ef4444; padding: 1rem; border: 1px solid #fecaca; background-color: #fef2f2; border-radius: 0.5rem; margin: 1rem 0;">
            <strong>Mermaid渲染错误:</strong> ${error.message || '未知错误'}
            <details style="margin-top: 0.5rem;">
              <summary style="cursor: pointer; color: #6b7280;">查看原始代码</summary>
              <pre style="background: #f3f4f6; padding: 0.5rem; margin-top: 0.5rem; border-radius: 0.25rem; overflow-x: auto; font-size: 0.875rem;">${chart}</pre>
            </details>
          </div>`
        }
      })
    } catch (err) {
      console.error('Mermaid initialization error:', err)
      setError('Mermaid初始化失败')
    }
  }, [chart, id, isLoaded])

  return (
    <div
      ref={elementRef}
      className="mermaid-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '1.5rem 0',
        overflow: 'auto',
        minHeight: '200px',
        border: error ? '1px solid #fecaca' : 'none',
        borderRadius: '0.5rem',
        background: error ? '#fef2f2' : 'transparent'
      }}
    >
      {!isLoaded && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          正在加载Mermaid图表...
        </div>
      )}
    </div>
  )
}