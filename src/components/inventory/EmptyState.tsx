import { Package } from "lucide-react";

export const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="bg-muted rounded-full p-4 mb-4">
            <Package className="h-8 w-8 opacity-40" />
        </div>
        <p className="font-medium">No se encontraron materiales</p>
    </div>
);