"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface InventoryPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function InventoryPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
}: InventoryPaginationProps) {
  if (totalItems === 0) return null;

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-2 border-t text-xs text-muted-foreground select-none">
      {/* Items count summary */}
      <div className="text-center sm:text-left">
        Mostrando <strong className="text-foreground font-semibold">{startIndex + 1}</strong> -{" "}
        <strong className="text-foreground font-semibold">{endIndex}</strong> de{" "}
        <strong className="text-foreground font-semibold">{totalItems}</strong> materiales
      </div>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span>Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-background border rounded px-2 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>por pág.</span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0 hidden sm:inline-flex"
            title="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 px-2 sm:px-2.5 gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sm:hidden">Ant.</span>
          </Button>

          {/* Numbered page buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${page}`}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(Number(page))}
                  className={`h-8 w-8 p-0 font-medium ${
                    currentPage === page ? "pointer-events-none" : ""
                  }`}
                >
                  {page}
                </Button>
              )
            )}
          </div>

          {/* Compact page display (Mobile) */}
          <div className="sm:hidden px-2 font-medium text-foreground">
            {currentPage} / {totalPages}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 px-2 sm:px-2.5 gap-1"
          >
            <span className="sm:hidden">Sig.</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0 hidden sm:inline-flex"
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
