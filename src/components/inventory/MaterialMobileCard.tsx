import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MaterialActions } from "./MaterialActions";
import { StockBadge } from "./StockBadge";
import { Badge } from "@/components/ui/badge";
import { CommonProps, Material } from "../../lib/type";

export const MaterialMobileCard = ({ material, ...props }: { material: Material } & CommonProps) => (
    <Card className="transition-all gap-2 py-2">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">{material.name}</CardTitle>
                <StockBadge current={material.currentStock} min={material.minStock} />
            </div>
        </CardHeader>
        <CardContent className="space-y-2">
            <div className="flex gap-1.5 flex-wrap pb-0">
                {material.category && <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">{material.category.name}</Badge>}
                {material.location && <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">{material.location.name}</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted/30 p-2 rounded-md">
                    <p className="text-muted-foreground">Actual</p>
                    <p className={cn("font-bold text-lg", material.currentStock <= material.minStock && "text-amber-600")}>
                        {material.currentStock} <span className="font-normal text-muted-foreground">{material.unit}</span>
                    </p>
                </div>
                <div className="bg-muted/30 p-2 rounded-md">
                    <p className="text-muted-foreground">Mínimo</p>
                    <p className="font-medium text-lg">
                        {material.minStock} <span className="font-normal text-muted-foreground">{material.unit}</span>
                    </p>
                </div>
            </div>
            <MaterialActions material={material} {...props} />
        </CardContent>
    </Card>
);
