import { cn } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { MaterialForm } from "./material-form";
import { Button } from "@/components/ui/button";
import { CommonProps, Material } from "../../lib/type";

export const MaterialActions = ({
    material,
    ...props
}: { material: Material } & CommonProps) => (
    <div className={cn("flex gap-2 w-full pt-2")}>

        <MaterialForm
            material={material}
            userId={props.userId}
            categories={props.categories}
            locations={props.locations}
            trigger={
                <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Button>
            }
        />

        <Button
            variant="outline"
            size="sm"
            className={cn(
                "text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 px-1",
            )}
            onClick={() => props.handleDelete(material.id)}
        >
            <Trash2 />
            Eliminar
        </Button>
    </div>
);
