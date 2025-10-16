'use client'

import { useEffect, useRef, useState } from 'react'

interface MarkmapProps {
  content: string
  id?: string
}

// 改进的markdown到markmap数据转换器
function simpleMarkdownTransform(markdown: string) {
  const lines = markdown.split('\n')

  // 查找第一个一级标题作为根节点
  let rootTitle = 'MQ选型'
  let foundFirstHeading = false

  for (const line of lines) {
    const headingMatch = line.match(/^#\s+(.+)$/)
    if (headingMatch && !foundFirstHeading) {
      rootTitle = headingMatch[1].trim()
      foundFirstHeading = true
      break
    }
  }

  const root: any = { content: rootTitle, children: [] }
  const stack: any[] = [root]

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return

    // 处理标题 (# ## ###)
    const headingMatch = line.match(/^(#+)\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = headingMatch[2].trim()

      // 跳过已使用的根标题，避免重复
      if (level === 1 && content === rootTitle) {
        foundFirstHeading = true
        return // 跳过根标题，不创建节点
      }

      const node = { content, children: [] }

      // 对于标题，使用标题层级直接计算
      // 一级标题 (level=1) -> 作为根节点的直接子节点
      // 二级标题 (level=2) -> 作为根节点的直接子节点
      // 三级标题 (level=3) -> 作为二级标题的子节点

      // 调整栈到合适的父级
      // level=1: 应该在根节点下 (stack.length=1)
      // level=2: 应该在根节点下 (stack.length=1)
      // level=3: 应该在最后一个二级标题下

      while (stack.length > Math.max(1, level - 1)) {
        stack.pop()
      }

      stack[stack.length - 1].children.push(node)
      stack.push(node)
      return
    }

    // 处理列表项 (- - -)
    const listMatch = line.match(/^(\s*)[-*+]\s+(.+)$/)
    if (listMatch) {
      const indent = listMatch[1].length
      const content = listMatch[2].trim()
      const node = { content, children: [] }

      // 计算列表层级 (每2个空格算一个层级)
      const listLevel = Math.floor(indent / 2) + 1

      // 列表项应该作为最近的标题节点的子节点
      // 如果栈的长度大于1，且最后一个节点是标题，则列表项作为其子节点
      // 否则列表项作为根节点的子节点

      while (stack.length > 1 && listLevel < (stack.length - 1)) {
        stack.pop()
      }

      // 如果栈只有根节点，列表项作为根节点的子节点
      if (stack.length === 1) {
        root.children.push(node)
      } else {
        stack[stack.length - 1].children.push(node)
      }

      stack.push(node)
      return
    }

    // 处理没有标记的行 (作为当前节点的文本)
    if (stack.length > 1 && trimmed) {
      const currentNode = stack[stack.length - 1]
      if (currentNode.content && !currentNode.children.length) {
        // 如果当前节点没有子节点，添加为内容
        currentNode.content += ' ' + trimmed
      }
    }
  })

  return root
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

      // 详细检查markmap的各种可能结构
      const globalKeys = Object.keys(win).filter(key =>
        key.toLowerCase().includes('markmap')
      )

      console.log('Available markmap globals:', globalKeys)

      // 检查window.markmap的详细结构
      if (win.markmap) {
        console.log('window.markmap structure:', win.markmap)
        console.log('window.markmap keys:', Object.keys(win.markmap))
        console.log('window.markmap type:', typeof win.markmap)
      }

      // 检查不同的可能结构
      const markmapDirect = !!win.markmap
      const markmapLib = !!(win.markmap || {}).Markmap
      const markmapView = !!(win.markmapView || {}).Markmap
      const markmapAuto = !!(win.Markmap) // 直接全局变量

      console.log('Markmap structure check:', {
        markmapDirect,
        markmapLib,
        markmapView,
        markmapAuto,
        availableKeys: globalKeys
      })

      // 尝试找到可用的Markmap构造函数 - 支持更多可能性
      let MarkmapConstructor = null
      let TransformFunction = null

      // 检查不同的可能位置
      if (win.markmap) {
        // 可能是函数本身
        if (typeof win.markmap === 'function') {
          MarkmapConstructor = win.markmap
          console.log('Found markmap as function')
        }
        // 可能是对象，包含Markmap
        else if (win.markmap.Markmap) {
          MarkmapConstructor = win.markmap.Markmap
          TransformFunction = win.markmap.transform
          console.log('Found markmap.Markmap')
        }
        // 可能是对象，包含其他属性
        else {
          console.log('Checking markmap object properties:')
          Object.keys(win.markmap).forEach(key => {
            console.log(`  ${key}:`, typeof win.markmap[key])
            if (key.toLowerCase().includes('mark') || typeof win.markmap[key] === 'function') {
              if (!MarkmapConstructor) {
                MarkmapConstructor = win.markmap[key]
                console.log(`Found potential Markmap constructor in: ${key}`)
              }
            }
          })
        }
      }

      // autoloader可能将Markmap放在不同位置
      if (!MarkmapConstructor) {
        // 检查是否有自动加载的markmap
        const possibleNames = ['Markmap', 'markmap', 'mm']
        possibleNames.forEach(name => {
          if (win[name] && typeof win[name] === 'function') {
            MarkmapConstructor = win[name]
            console.log(`Found Markmap constructor as ${name}`)
          }
        })
      }

      // 检查是否有d3和transform
      if (!TransformFunction && win.d3 && win.d3.markmap) {
        TransformFunction = win.d3.markmap.transform
        console.log('Found transform in d3.markmap')
      }

      // 检查其他可能的位置
      if (!MarkmapConstructor && win.markmapView && win.markmapView.Markmap) {
        MarkmapConstructor = win.markmapView.Markmap
        console.log('Found markmapView.Markmap')
      } else if (!MarkmapConstructor && win.Markmap) {
        MarkmapConstructor = win.Markmap
        console.log('Found global Markmap')
      }

      // 临时存储找到的构造函数
      if (MarkmapConstructor) {
        (window as any)._tempMarkmap = {
          Markmap: MarkmapConstructor,
          transform: TransformFunction || win.markmap?.transform
        }
        console.log('Markmap constructor found and stored')
      } else {
        console.error('No Markmap constructor found in any location')
      }

      return !!MarkmapConstructor
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
        // 使用临时存储的markmap引用
        const tempMarkmap = (window as any)._tempMarkmap
        if (tempMarkmap && tempMarkmap.Markmap) {
          setStatus('ready')
          console.log('Markmap ready for rendering')
        } else {
          console.error('Markmap constructor not found')
          setStatus('fallback')
        }
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
        const tempMarkmap = (window as any)._tempMarkmap

        if (!tempMarkmap || !tempMarkmap.Markmap) {
          console.error('Markmap not available for rendering')
          setStatus('fallback')
          return
        }

        const { Markmap, transform: originalTransform } = tempMarkmap

        // 如果没有transform函数，使用简化的markdown解析
        const transform = originalTransform || simpleMarkdownTransform
        if (!originalTransform) {
          console.warn('Transform function not available, using simple markdown parser')
        }

        // 创建markmap实例
        const mm = Markmap.create(svgRef.current, {
          duration: 300,
          autoFit: true,
          initialExpandLevel: 2,
          paddingX: 12,
          paddingY: 12,
          spacingVertical: 15,
          spacingHorizontal: 100,
          maxWidth: 300,
          color: (node: any) => {
            // 根据节点内容和层级设置颜色
            const colors = [
              '#4caf50', // 性能要求 - 绿色
              '#ff9800', // 功能需求 - 橙色
              '#9c27b0', // 可靠性 - 紫色
              '#e91e63', // 运维复杂度 - 粉色
              '#03a9f4', // 生态系统 - 蓝色
            ]

            const content = node.content || ''

            // 根据内容匹配颜色
            if (content.includes('性能要求')) return colors[0]
            if (content.includes('功能需求')) return colors[1]
            if (content.includes('可靠性')) return colors[2]
            if (content.includes('运维复杂度')) return colors[3]
            if (content.includes('生态系统')) return colors[4]

            // 子节点使用父节点颜色的淡化版本
            return '#6b7280'
          },
        })

        // 解析markdown内容并渲染
        const root = transform(content)

        // 调试：显示解析后的数据结构
        console.log('Parsed markmap data:', JSON.stringify(root, null, 2))
        console.log('Original markdown content:', content)

        mm.setData(root)
        mm.fit()

        console.log('Markmap rendered successfully')
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