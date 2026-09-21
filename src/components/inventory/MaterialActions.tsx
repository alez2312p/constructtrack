"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Edit, Trash2, QrCode } from "lucide-react";
import { MaterialForm } from "./material-form";
import { Button } from "@/components/ui/button";
import { CommonProps, Material } from "../../lib/type";
import { MaterialQRModal } from "./material-qr-modal";

export const MaterialActions = ({
    material,
    ...props
}: { material: Material } & CommonProps) => {
    const [qrOpen, setQrOpen] = useState(false);

    return (
        <div className={cn("flex gap-2 w-full pt-2")}>
            <MaterialForm
                material={material}
                userId={props.userId}
                categories={props.categories}
                locations={props.locations}
                trigger={
                    <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                    </Button>
                }
            />

            <Button
                variant="outline"
                size="sm"
                className="px-2.5"
                title="Generar e imprimir código QR"
                onClick={() => setQrOpen(true)}
            >
                <QrCode className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="sm"
                className={cn(
                    "text-destructive hover:text-destructive hover:bg-destructive/10 px-2.5",
                )}
                title="Eliminar material"
                onClick={() => props.handleDelete(material.id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <MaterialQRModal
                material={material}
                open={qrOpen}
                onOpenChange={setQrOpen}
            />
        </div>
    );
};
