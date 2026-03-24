import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2 px-3">
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent className="px-3 pt-0">
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </CardContent>
      </Card>

      {/* Recent Movements Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
