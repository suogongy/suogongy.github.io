import Link from 'next/link'
import { PaginationResult } from '@/lib/content'

interface StaticPaginationProps {
  pagination: PaginationResult
  baseUrl: string
}

export default function StaticPagination({ pagination, baseUrl }: StaticPaginationProps) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage, totalItems } = pagination

  if (totalPages <= 1) return null

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
            href={currentPage === 2 ? baseUrl : `${baseUrl}/page-${currentPage - 1}`}
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
                href={page === 1 ? baseUrl : `${baseUrl}/page-${page}`}
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
            href={`${baseUrl}/page-${currentPage + 1}`}
            className="pagination-button next"
            aria-label="下一页"
          >
            下一页 →
          </Link>
        )}
      </div>
    </div>
  )
}