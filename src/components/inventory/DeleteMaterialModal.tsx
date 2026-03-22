
import { Button } from "../ui/button"
import { DialogContent, DialogHeader, DialogFooter, Dialog, DialogTitle, DialogDescription } from "../ui/dialog"

interface DeleteMaterialModalProps {
    deleteId: boolean;
    deleteLoading: boolean;
    handleDeleteCancel: () => void;
    handleDeleteConfirm: () => void;
}

const DeleteMaterialModal = ({
    deleteId,
    deleteLoading,
    handleDeleteCancel,
    handleDeleteConfirm,
}: DeleteMaterialModalProps
) => {
    return (
        <Dialog open={!!deleteId} onOpenChange={handleDeleteCancel}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Confirmar eliminación</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    ¿Estás seguro de que deseas eliminar este material? Esta acción no se puede deshacer.
                </DialogDescription>
                <DialogFooter>
                    <Button variant="outline" onClick={handleDeleteCancel}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteConfirm}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? "Eliminando..." : "Eliminar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteMaterialModal