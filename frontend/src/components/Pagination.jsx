import React from 'react'

function Pagination({ currentPage, totalPages, onPageChange }) {
  // Tính toán các trang cần hiển thị
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5 // Số trang tối đa hiển thị
    
    if (totalPages <= maxVisible) {
      // Nếu tổng số trang <= maxVisible, hiển thị tất cả
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Logic để hiển thị trang hiện tại ở giữa
      let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2))
      let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1)
      
      // Điều chỉnh nếu gần cuối
      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(0, endPage - maxVisible + 1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return null // Không hiển thị pagination nếu chỉ có 1 trang
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
            currentPage === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : 'bg-white text-gray-700 hover:bg-vest-gold hover:text-vest-dark hover:border-vest-gold border-gray-300 shadow-sm hover:shadow-md'
          }`}
          title="Trang trước"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* First Page (nếu không hiển thị) */}
        {pageNumbers[0] > 0 && (
          <>
            <button
              onClick={() => onPageChange(0)}
              className="px-4 py-2 rounded-lg border-2 bg-white text-gray-700 hover:bg-vest-gold hover:text-vest-dark hover:border-vest-gold border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              1
            </button>
            {pageNumbers[0] > 1 && (
              <span className="px-2 text-gray-400 font-medium">...</span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium min-w-[44px] ${
              pageNum === currentPage
                ? 'bg-vest-gold text-vest-dark border-vest-gold shadow-md scale-105'
                : 'bg-white text-gray-700 hover:bg-vest-gold hover:text-vest-dark hover:border-vest-gold border-gray-300 shadow-sm hover:shadow-md'
            }`}
          >
            {pageNum + 1}
          </button>
        ))}

        {/* Last Page (nếu không hiển thị) */}
        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
              <span className="px-2 text-gray-400 font-medium">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages - 1)}
              className="px-4 py-2 rounded-lg border-2 bg-white text-gray-700 hover:bg-vest-gold hover:text-vest-dark hover:border-vest-gold border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
            currentPage >= totalPages - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : 'bg-white text-gray-700 hover:bg-vest-gold hover:text-vest-dark hover:border-vest-gold border-gray-300 shadow-sm hover:shadow-md'
          }`}
          title="Trang sau"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Pagination

