'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PaginationResult } from '@/lib/content'

interface PaginationProps {
  pagination: PaginationResult
  baseUrl: string
}

export default function Pagination({ pagination, baseUrl }: PaginationProps) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage, totalItems } = pagination
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  // 构建页面URL
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  // 生成页码数组
  const getVisiblePages = () => {
    const pages: number[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 总是显示第一页
      pages.push(1)

      if (currentPage > 3) {
        pages.push(-1) // 省略号标记
      }

      // 显示当前页附近的页码
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push(-1) // 省略号标记
      }

      // 总是显示最后一页
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        <span>
          第 {currentPage} 页，共 {totalPages} 页 | 总计 {totalItems} 篇文章
        </span>
      </div>

      <div className="pagination-controls">
        {/* 上一页 */}
        {hasPrevPage && (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className="pagination-button prev"
            aria-label="上一页"
          >
            ← 上一页
          </Link>
        )}

        {/* 页码 */}
        <div className="pagination-numbers">
          {getVisiblePages().map((page, index) => (
            page === -1 ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            ) : (
              <Link
                key={page}
                href={buildPageUrl(page)}
                className={`pagination-number ${
                  page === currentPage ? 'active' : ''
                }`}
                aria-label={`第 ${page} 页`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </Link>
            )
          ))}
        </div>

        {/* 下一页 */}
        {hasNextPage && (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className="pagination-button next"
            aria-label="下一页"
          >
            下一页 →
          </Link>
        )}
      </div>

      <style jsx>{`
        .pagination {
          margin-top: 3rem;
          padding: 2rem 0;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pagination-info {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .pagination-button {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-primary);
          text-decoration: none;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .pagination-button:hover {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          transform: translateY(-1px);
        }

        .pagination-numbers {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .pagination-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-primary);
          text-decoration: none;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .pagination-number:hover {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          transform: translateY(-1px);
        }

        .pagination-number.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          font-weight: 600;
        }

        .pagination-ellipsis {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          color: var(--text-secondary);
          font-weight: bold;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .pagination {
            margin-top: 2rem;
            padding: 1.5rem 0;
          }

          .pagination-controls {
            gap: 0.25rem;
          }

          .pagination-button {
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
          }

          .pagination-number {
            width: 2.2rem;
            height: 2.2rem;
            font-size: 0.85rem;
          }

          .pagination-info {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  )
}