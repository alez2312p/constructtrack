import { MovementData } from "@/lib/type";
import { Package } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogHeader } from "../ui/dialog";
import Badges from "./badges";

interface DialogDetailsMovementProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    colorClass: string;
    icon: React.ElementType;
    isIn: boolean;
    movement: MovementData;

}
const DialogDetailsMovement = ({ open, setOpen, colorClass, icon: Icon, isIn, movement }: DialogDetailsMovementProps) => {
    return (

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                        <span>{isIn ? "Entrada de Material" : "Salida de Material"}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Detalle del Material */}
                    <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Material</p>
                            <p className="font-medium">{movement.material.name}</p>
                            <Badges movement={movement} />
                        </div>
                    </div>
                    {/* Cantidad */}
                    <div className="flex items-center gap-3">
                        <span className={`text-xl font-bold w-5 text-center ${colorClass}`}>
                            {isIn ? "+" : "-"}
                        </span>
                        <div>
                            <p className="text-sm text-muted-foreground">Cantidad total</p>
                            <p className="font-medium text-lg">
                                {movement.quantity} {movement.material.unit}
                            </p>
                        </div>
                    </div>
                    {/* Fecha */}
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium text-muted-foreground`}>Fecha</span>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {new Date(movement.date).toLocaleString("es-ES", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                })}
                            </p>
                        </div>
                    </div>
                    {/* Usuario */}
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium text-muted-foreground`}>Usuario</span>
                        <div>
                            <p className="font-medium">{movement.user.name}</p>
                        </div>
                    </div>
                    {/* Notas */}
                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium text-muted-foreground`}>Notas</span>
                        <div>
                            <p className="text-sm">{movement.notes || "Sin notas"}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DialogDetailsMovement