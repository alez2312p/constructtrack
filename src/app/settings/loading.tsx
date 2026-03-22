import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
    return (
        <div className="space-y-6">
            {/* Card Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-64" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}