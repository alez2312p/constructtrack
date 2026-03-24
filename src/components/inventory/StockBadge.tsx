import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const StockBadge = ({ current, min }: { current: number; min: number }) => {
    if (current === 0) {
        return (
            <Badge
                variant="secondary"
                className="font-semibold border-none shadow-none bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
            >
                Agotado
            </Badge>
        );
    }

    const isLow = current <= min;
    return (
        <Badge
            variant="secondary"
            className={cn(
                "font-semibold border-none shadow-none",
                isLow
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
            )}
        >
            {isLow ? "Stock Bajo" : "Normal"}
        </Badge>
    );
};
