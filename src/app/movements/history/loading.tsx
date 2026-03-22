import { Skeleton } from "@/components/ui/skeleton";

export default function MovementsHistoryLoading() {
    return (
        <div className="space-y-6">
            {/* Title */}
            <Skeleton className="h-8 w-48" />

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
            </div>

            {/* List Content */}
            <div className="space-y-4">
                {/* Desktop Table Skeleton */}
                <div className="hidden md:block space-y-2">
                    <Skeleton className="h-10 w-full" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>

                {/* Mobile Cards Skeleton */}
                <div className="md:hidden space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}