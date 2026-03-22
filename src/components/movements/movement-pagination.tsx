import Link from "next/link";
import { Button } from "@/components/ui/button";

function buildQueryString(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  return searchParams.toString();
}

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  days: string;
  from: string;
  to: string;
  materialId: string;
  type: string;
}

export function Pagination({ 
  page, 
  totalPages, 
  totalCount, 
  days, 
  from, 
  to, 
  materialId, 
  type 
}: PaginationProps) {
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  if (totalPages <= 1) return null;

  const baseParams = { days, from, to, materialId, type };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">
        {totalCount} registros
      </div>
      <div className="flex gap-2">
        {hasPrevPage && (
          <Link
            href={`/movements/history?${buildQueryString({ ...baseParams, page: String(page - 1) })}`}
          >
            <Button variant="outline" size="sm">
              Anterior
            </Button>
          </Link>
        )}
        {hasNextPage && (
          <Link
            href={`/movements/history?${buildQueryString({ ...baseParams, page: String(page + 1) })}`}
          >
            <Button variant="outline" size="sm">
              Siguiente
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export function PaginationDesktop({ 
  page, 
  totalPages, 
  totalCount, 
  days, 
  from, 
  to, 
  materialId, 
  type 
}: PaginationProps) {
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  if (totalPages <= 1) return null;

  const baseParams = { days, from, to, materialId, type };

  return (
    <div className="flex items-center justify-between py-4 px-2">
      <div className="text-sm text-muted-foreground">
        Página {page} de {totalPages} ({totalCount} registros)
      </div>
      <div className="flex gap-2">
        {hasPrevPage && (
          <Link
            href={`/movements/history?${buildQueryString({ ...baseParams, page: String(page - 1) })}`}
          >
            <Button variant="outline" size="sm">
              Anterior
            </Button>
          </Link>
        )}
        {hasNextPage && (
          <Link
            href={`/movements/history?${buildQueryString({ ...baseParams, page: String(page + 1) })}`}
          >
            <Button variant="outline" size="sm">
              Siguiente
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
