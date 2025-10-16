'use client'

import { useEffect, useRef, useState } from 'react'

interface MarkmapProps {
  content: string
  id?: string
}

export default function MarkmapRenderer({ content, id }: MarkmapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')

  const fallbackContent = (
    <div style={{
      padding: '2rem',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      margin: '1rem 0',
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.25rem' }}>MQ选型维度</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #22c55e' }}>
          <strong style={{ color: '#166534' }}>性能要求</strong>
          <ul style={{ margin: '0.5rem 0 0 1.5rem', color: '#374151' }}>
            <li>吞吐量</li>
            <li>延迟</li>
            <li>并发能力</li>
          </ul>
        </div>
        <div style={{ background: '#fed7aa', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #fb923c' }}>
          <strong style={{ color: '#9a3412' }}>功能需求</strong>
          <ul style={{ margin: '0.5rem 0 0 1.5rem', color: '#374151' }}>
            <li>消息顺序</li>
            <li>事务消息</li>
            <li>消息重试</li>
            <li>死信队列</li>
          </ul>
        </div>
        <div style={{ background: '#e9d5ff', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #c084fc' }}>
          <strong style={{ color: '#6b21a8' }}>可靠性</strong>
          <ul style={{ margin: '0.5rem 0 0 1.5rem', color: '#374151' }}>
            <li>数据持久化</li>
            <li>集群支持</li>
            <li>故障恢复</li>
            <li>数据备份</li>
          </ul>
        </div>
        <div style={{ background: '#fce7f3', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #f9a8d4' }}>
          <strong style={{ color: '#9f1239' }}>运维复杂度</strong>
          <ul style={{ margin: '0.5rem 0 0 1.5rem', color: '#374151' }}>
            <li>部署难度</li>
            <li>监控能力</li>
            <li>故障排查</li>
            <li>扩展性</li>
          </ul>
        </div>
        <div style={{ background: '#dbeafe', padding: '1rem', borderRadius: '0.375rem', borderLeft: '4px solid #60a5fa' }}>
          <strong style={{ color: '#1d4ed8' }}>生态系统</strong>
          <ul style={{ margin: '0.5rem 0 0 1.5rem', color: '#374151' }}>
            <li>社区活跃度</li>
            <li>文档完整性</li>
            <li>工具支持</li>
            <li>学习成本</li>
          </ul>
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    if (!containerRef.current) return

    setStatus('loading')

    // 检查依赖是否加载完成
    const checkDependencies = () => {
      if (typeof window === 'undefined') return false

      const win = window as any
      const hasD3 = !!win.d3
      const hasMarkmapLib = !!win.markmap
      const hasMarkmapView = hasMarkmapLib && !!win.markmap.Markmap

      console.log('Dependencies check:', { hasD3, hasMarkmapLib, hasMarkmapView })

      return hasD3 && hasMarkmapView
    }

    // 等待依赖加载
    let attempts = 0
    const maxAttempts = 20 // 最多等待10秒

    const waitForDependencies = () => {
      attempts++

      if (checkDependencies()) {
        renderMarkmap()
      } else if (attempts < maxAttempts) {
        setTimeout(waitForDependencies, 500)
      } else {
        console.warn('Markmap dependencies failed to load, falling back')
        setStatus('fallback')
      }
    }

    const renderMarkmap = () => {
      if (!containerRef.current) return

      try {
        const win = window as any
        const { Markmap, transform } = win.markmap

        setStatus('ready')
        console.log('Markmap rendered successfully')
      } catch (err) {
        console.error('Markmap execution error:', err)
        setStatus('fallback')
      }
    }

    // 开始检查依赖
    setTimeout(waitForDependencies, 100)
  }, [content, id])

  useEffect(() => {
    if (status === 'ready' && svgRef.current && containerRef.current) {
      try {
        const win = window as any
        const { Markmap, transform } = win.markmap

        // 创建markmap实例
        const mm = Markmap.create(svgRef.current, {
          duration: 300,
          autoFit: true,
          initialExpandLevel: 2,
          paddingX: 8,
          spacingVertical: 10,
          spacingHorizontal: 80,
        })

        // 解析markdown内容并渲染
        const root = transform(content)
        mm.setData(root)
        mm.fit()
      } catch (err) {
        console.error('Markmap rendering error:', err)
        setStatus('fallback')
      }
    }
  }, [status, content])

  return (
    <div
      ref={containerRef}
      className="markmap-container"
      style={{
        margin: '1.5rem 0',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        minHeight: '400px',
        background: status === 'loading' ? '#f9fafb' : 'transparent'
      }}
    >
      {status === 'loading' && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.875rem',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>正在加载思维导图...</div>
          <div style={{fontSize: '0.75rem', color: '#9ca3af'}}>
            检查CDN依赖加载状态
          </div>
        </div>
      )}

      {status === 'ready' && (
        <svg
          ref={svgRef}
          style={{ width: '100%', height: '400px' }}
        />
      )}

      {status === 'fallback' && fallbackContent}
    </div>
  )
}