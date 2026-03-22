import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MovementsLoading() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>

            {/* List Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}