import Link from "next/link";
import { Button } from "@/components/ui/button";

function buildQueryString(params: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  return searchParams.toString();
}

interface CursorPaginationProps {
  hasNextPage: boolean;
  nextCursor: string | null;
  days: string;
  from: string;
  to: string;
  materialId: string;
  type: string;
  limit: number;
  totalCount: number;
}

export function CursorPagination({
  hasNextPage,
  nextCursor,
  days,
  from,
  to,
  materialId,
  type,
  limit,
  totalCount
}: CursorPaginationProps) {
  if (!hasNextPage && !nextCursor) return null;

  const baseParams = { days, from, to, materialId, type, limit: String(limit) };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">
        {totalCount} registros
      </div>
      <div className="flex gap-2">
        {hasNextPage && (
          <Link
            href={`/movements/history?${buildQueryString({ ...baseParams, cursor: nextCursor ?? undefined })}`}
          >
            <Button variant="outline" size="sm" >
              Ver más
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
