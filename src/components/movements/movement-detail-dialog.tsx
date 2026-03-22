import { MovementData } from "@/lib/type";
import { ArrowUpLeft, ArrowDownLeft, Package, Calendar, User, FileText } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogHeader } from "../ui/dialog";
import { Badge } from "../ui/badge";

export function MovementDetailDialog({ movement, open, onOpenChange }: { movement: MovementData | null; open: boolean; onOpenChange: (open: boolean) => void }) {
    if (!movement) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {movement.type === "IN" ? (
                            <>
                                <ArrowUpLeft className="h-5 w-5 text-green-600" />
                                <span className="text-green-600">Entrada|</span>
                            </>
                        ) : (
                            <>
                                <ArrowDownLeft className="h-5 w-5 text-red-600" />
                                <span className="text-red-600">Salida</span>
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Material</p>
                            <p className="font-medium">{movement.material.name}</p>
                            {(movement.material.category || movement.material.location) && (
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {movement.material.category && (
                                        <Badge variant="outline" className="text-xs">
                                            {movement.material.category.name}
                                        </Badge>
                                    )}
                                    {movement.material.location && (
                                        <Badge variant="outline" className="text-xs">
                                            {movement.material.location.name}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 flex items-center justify-center">
                            <span className={`text-lg font-bold ${movement.type === "IN" ? "text-green-600" : "text-red-600"}`}>
                                {movement.type === "IN" ? "+" : "-"}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Cantidad</p>
                            <p className="font-medium">
                                {movement.quantity} {movement.material.unit}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                            <p className="font-medium">
                                {new Date(movement.date).toLocaleString("es-ES")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Usuario</p>
                            <p className="font-medium">{movement.user.name}</p>
                        </div>
                    </div>

                    {movement.notes && (
                        <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Notas</p>
                                <p className="font-medium whitespace-pre-wrap">{movement.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
