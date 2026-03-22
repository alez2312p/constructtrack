import { Card, CardContent } from "@/components/ui/card";

export default function InventoryLoading() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-10 w-36 bg-muted animate-pulse rounded" />
      </div>

      {/* Search Skeleton */}
      <div className="h-10 w-full bg-muted animate-pulse rounded" />

      {/* Filters Skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-full" />
        ))}
      </div>

      {/* Cards Skeleton (Mobile) */}
      <div className="md:hidden space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton (Desktop) */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
