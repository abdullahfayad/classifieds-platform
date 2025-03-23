import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push("ellipsis");
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push("ellipsis");
        }
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const pages = getPageNumbers();

  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}page=${page}`;
  };

  return (
    <nav className="flex items-center justify-center mt-4">
      <ul className="flex">
        <li>
          {currentPage > 1 ? (
            <Link
              href={getPageUrl(currentPage - 1)}
              className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Previous
            </Link>
          ) : (
            <span className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-400 bg-white border border-gray-300 rounded-md cursor-not-allowed">
              Previous
            </span>
          )}
        </li>

        {pages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <li key={`ellipsis-${index}`}>
                <span className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white">
                  ...
                </span>
              </li>
            );
          }

          return (
            <li key={`page-${page}`}>
              {page === currentPage ? (
                <span className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md">
                  {page}
                </span>
              ) : (
                <Link
                  href={getPageUrl(page as number)}
                  className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}

        <li>
          {currentPage < totalPages ? (
            <Link
              href={getPageUrl(currentPage + 1)}
              className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next
            </Link>
          ) : (
            <span className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-400 bg-white border border-gray-300 rounded-md cursor-not-allowed">
              Next
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
