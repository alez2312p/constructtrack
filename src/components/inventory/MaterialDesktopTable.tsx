import { Card, CardContent } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { MaterialActions } from "./MaterialActions";
import { StockBadge } from "./StockBadge";
import { CommonProps, Material } from "../../lib/type";

export const MaterialDesktopTable = ({ materials, ...props }: { materials: Material[] } & CommonProps) => (
    <div className="hidden md:flex flex-col flex-1 min-h-0">
        <Card className="py-0 flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-0 flex-1 overflow-auto relative border rounded-lg">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                            {["Nombre", "Categoría", "Ubicación", "Stock Actual", "Mínimo", "Estado",].map((h) => (
                                <TableHead key={h} className={cn("bg-muted/40 font-bold py-3")}>
                                    {h}
                                </TableHead>
                            ))}
                            <TableHead className="bg-muted/40 font-bold py-3 text-right w-28">
                                Acciones
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40">
                                    <EmptyState />
                                </TableCell>
                            </TableRow>
                        ) : (
                            materials.map((m) => (
                                <TableRow
                                    key={m.id}
                                    className={cn(
                                        "transition-colors group",
                                        m.currentStock === 0
                                            ? "bg-red-50/30 dark:bg-red-950/10 hover:bg-red-50/50"
                                            : m.currentStock <= m.minStock
                                                ? "bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/50"
                                                : "hover:bg-muted/30"
                                    )}
                                >
                                    <TableCell className="truncate max-w-36">{m.name}</TableCell>
                                    <TableCell className="truncate max-w-36">{m.category?.name || "-"}</TableCell>
                                    <TableCell className="truncate max-w-36">{m.location?.name || "-"}</TableCell>
                                    <TableCell className="truncate max-w-36">{m.currentStock} {m.unit}</TableCell>
                                    <TableCell className="truncate max-w-36">{m.minStock} {m.unit}</TableCell>
                                    <TableCell className="truncate max-w-36"><StockBadge current={m.currentStock} min={m.minStock} /></TableCell>
                                    <TableCell className="text-right">
                                        <MaterialActions material={m} {...props} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
);