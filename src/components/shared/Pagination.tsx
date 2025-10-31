// Pagination Component - UI for pagination controls
// Works with usePagination hook

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PaginationControls } from '../../hooks/usePagination';

interface PaginationProps extends Pick<PaginationControls, 'page' | 'pageSize' | 'total' | 'totalPages' | 'hasNext' | 'hasPrev' | 'nextPage' | 'prevPage' | 'goToPage' | 'setPageSize'> {
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  showTotal?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Pagination Component
 * 
 * @example
 * ```tsx
 * const pagination = usePagination({ initialPageSize: 20 });
 * 
 * <Pagination {...pagination} showTotal showPageSize />
 * ```
 */
export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  hasNext,
  hasPrev,
  nextPage,
  prevPage,
  goToPage,
  setPageSize,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  showTotal = true,
  compact = false,
  className = '',
}: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages === 0) {
    return null;
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = compact ? 3 : 5;
    const halfVisible = Math.floor(maxVisible / 2);

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (page <= halfVisible + 1) {
        // Near start
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - halfVisible) {
        // Near end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle
        pages.push(1);
        pages.push('...');
        for (let i = page - halfVisible; i <= page + halfVisible; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      {/* Total info */}
      {showTotal && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {total > 0 ? (
            <>
              {t('pagination.showing', 'Showing')} <span className="font-medium">{startItem}</span> - <span className="font-medium">{endItem}</span> {t('pagination.of', 'of')} <span className="font-medium">{total}</span>
            </>
          ) : (
            t('pagination.noResults', 'No results')
          )}
        </div>
      )}

      {/* Page controls */}
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        {showPageSize && (
          <div className="flex items-center gap-2 mr-4">
            <label htmlFor="pageSize" className="text-sm text-gray-600 dark:text-gray-400">
              {t('pagination.perPage', 'Per page')}:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Previous button */}
        <button
          onClick={prevPage}
          disabled={!hasPrev}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            hasPrev
              ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700'
              : 'text-gray-400 cursor-not-allowed dark:text-gray-600'
          }`}
          aria-label={t('pagination.previous', 'Previous page')}
        >
          {t('pagination.previous', 'Previous')}
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              );
            }

            const isActive = pageNum === page;
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum as number)}
                className={`min-w-[2rem] px-2 py-1 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-label={`${t('pagination.goToPage', 'Go to page')} ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={nextPage}
          disabled={!hasNext}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            hasNext
              ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700'
              : 'text-gray-400 cursor-not-allowed dark:text-gray-600'
          }`}
          aria-label={t('pagination.next', 'Next page')}
        >
          {t('pagination.next', 'Next')}
        </button>
      </div>
    </div>
  );
}

/**
 * Compact Pagination - For modals or tight spaces
 */
export function CompactPagination(props: Omit<PaginationProps, 'compact' | 'showTotal' | 'showPageSize'>) {
  return (
    <Pagination
      {...props}
      compact
      showTotal={false}
      showPageSize={false}
    />
  );
}

