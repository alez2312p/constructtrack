import { Skeleton } from "@/components/ui/skeleton";

export default function LocationsLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-6 w-1/2" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="pt-2">
                                <Skeleton className="h-9 w-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}