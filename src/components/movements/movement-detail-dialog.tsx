import { useState } from "react";
import { MovementData } from "@/lib/type";
import { ArrowUpLeft, ArrowDownLeft, Package, Calendar, User, FileText, Printer } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogHeader } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MovementReceiptModal } from "./movement-receipt-modal";

export function MovementDetailDialog({ movement, open, onOpenChange }: { movement: MovementData | null; open: boolean; onOpenChange: (open: boolean) => void }) {
    const [receiptOpen, setReceiptOpen] = useState(false);
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
                    {movement.project && (
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 flex items-center justify-center text-muted-foreground font-semibold text-xs">
                                🏗️
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Obra / Destino</p>
                                <p className="font-medium">{movement.project.name} {movement.project.code ? `(${movement.project.code})` : ""}</p>
                            </div>
                        </div>
                    )}

                    {movement.supplier && (
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 flex items-center justify-center text-muted-foreground font-semibold text-xs">
                                🚚
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Proveedor</p>
                                <p className="font-medium">{movement.supplier.name}</p>
                            </div>
                        </div>
                    )}

                    {movement.receiverName && (
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Receptor / Responsable</p>
                                <p className="font-medium">{movement.receiverName}</p>
                            </div>
                        </div>
                    )}

                    {movement.unitPrice !== undefined && movement.unitPrice !== null && (
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 flex items-center justify-center text-muted-foreground font-semibold text-xs">
                                💰
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Costo / Valor</p>
                                <p className="font-medium">
                                    ${movement.unitPrice.toLocaleString("es-ES", { minimumFractionDigits: 2 })} c/u (Total: ${(movement.unitPrice * movement.quantity).toLocaleString("es-ES", { minimumFractionDigits: 2 })})
                                </p>
                            </div>
                        </div>
                    )}

                    {movement.notes && (
                        <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Notas</p>
                                <p className="font-medium whitespace-pre-wrap">{movement.notes}</p>
                            </div>
                        </div>
                    )}

                    {movement.signature && (
                        <div className="space-y-1.5 pt-2 border-t">
                            <p className="text-sm text-muted-foreground font-medium">Firma Digital de Recepción:</p>
                            <div className="border rounded bg-white p-2 flex justify-center max-w-[280px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={movement.signature} alt="Firma digital" className="max-h-24 object-contain" />
                            </div>
                        </div>
                    )}

                    <div className="pt-3 border-t">
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-primary/40 hover:bg-primary/10 text-primary font-medium"
                            onClick={() => setReceiptOpen(true)}
                        >
                            <Printer className="h-4 w-4" />
                            Imprimir Vale / Comprobante
                        </Button>
                    </div>
                </div>

                <MovementReceiptModal
                    movement={movement}
                    open={receiptOpen}
                    onOpenChange={setReceiptOpen}
                />
            </DialogContent>
        </Dialog>
    );
}
