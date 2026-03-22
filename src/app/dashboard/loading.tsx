import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2 px-3">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="px-3 pt-0">
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </CardContent>
      </Card>

      {/* Recent Movements Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
