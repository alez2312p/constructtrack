import { cn } from "@/lib/utils";
import { StockAlert } from "../../lib/type";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";


const StockCard = ({
    material,
    variant,
    onRestock,
}: {
    material: StockAlert;
    variant: "critical" | "warning";
    onRestock: (material: StockAlert) => void;
}) => {
    const isCritical = variant === "critical";

    return (
        <div
            className={cn(
                "flex flex-col justify-between p-3 rounded-lg border shadow-sm gap-3",
                isCritical
                    ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50"
                    : "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50"
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-base truncate" title={material.name}>
                    {material.name}
                </span>
                {isCritical ? (
                    <Badge variant="destructive" className="text-base h-5 px-1.5 shrink-0">
                        AGOTADO
                    </Badge>
                ) : (
                    <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 text-base h-5 px-1.5 shrink-0"
                    >
                        {material.currentStock}/{material.minStock} {material.unit}
                    </Badge>
                )}
            </div>
            <Button
                size="sm"
                variant={isCritical ? "default" : "outline"}
                className={cn(
                    "w-full h-8 text-base",
                    isCritical
                        ? "bg-green-600 hover:bg-green-700"
                        : "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/50"
                )}
                onClick={() => onRestock(material)}
            >
                <Plus className="h-3 w-3 mr-1" />
                Reabastecer
            </Button>
        </div>
    );
}

export default StockCard