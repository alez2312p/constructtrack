import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Package, Plus } from "lucide-react"
import { StockAlert } from "../../lib/type"

interface RestockDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedMaterial: StockAlert | null
    onSubmit: (formData: FormData) => void
    isPending: boolean
    type: "IN" | "OUT"
    setType: (value: "IN" | "OUT") => void
    quantity: string
    setQuantity: (value: string) => void
    date: string
    setDate: (value: string) => void
}

export default function RestockDialog({
    open,
    onOpenChange,
    selectedMaterial,
    onSubmit,
    isPending,
    type,
    setType,
    quantity,
    setQuantity,
    date,
    setDate,
}: RestockDialogProps) {
    if (!selectedMaterial) return null
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reabastecer: {selectedMaterial.name}</DialogTitle>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Package className="h-4 w-4" />
                        <span className="text-sm">
                            Stock actual: <strong>{selectedMaterial.currentStock} {selectedMaterial.unit}</strong>
                        </span>
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Movimiento</Label>
                        <RadioGroup
                            value={type}
                            onValueChange={(value) => setType(value as "IN" | "OUT")}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="IN" id="in" />
                                <Label htmlFor="in" className="flex items-center gap-1 cursor-pointer font-medium">
                                    <Plus className="h-4 w-4 text-green-600" />
                                    Entrada
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad</Label>
                        <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            step="any"
                            min="0"
                            placeholder="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                            id="date"
                            name="date"
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas (opcional)</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Ej: Compra a proveedor X"
                            rows={2}
                            className="resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending || !quantity} className="bg-green-600 hover:bg-green-700">
                            {isPending ? "Guardando..." : "Registrar Entrada"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}