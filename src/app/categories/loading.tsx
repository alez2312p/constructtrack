import { Card, CardContent } from "@/components/ui/card";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-10 w-36 bg-muted animate-pulse rounded" />
      </div>

      {/* Categories List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}