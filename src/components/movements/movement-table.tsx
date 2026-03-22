"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MovementData } from "@/lib/type";
import { MovementDetailDialog } from "./movement-detail-dialog";

interface MovementTableProps {
  movements: MovementData[];
}


export function MovementTable({ movements }: MovementTableProps) {
  const [selectedMovement, setSelectedMovement] = useState<MovementData | null>(null);
  const [open, setOpen] = useState(false);

  const handleRowClick = (movement: MovementData) => {
    setSelectedMovement(movement);
    setOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay movimientos
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow
                    key={movement.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(movement)}
                  >
                    <TableCell>
                      {new Date(movement.date).toLocaleString("es-ES", { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{movement.material.name}</div>
                      <div className="flex gap-1 mt-1">
                        {movement.material.category && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                            {movement.material.category.name}
                          </Badge>
                        )}
                        {movement.material.location && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                            {movement.material.location.name}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${movement.type === "IN" ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"}`}>
                        {movement.type === "IN" ? "Entrada" : "Salida"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={movement.type === "IN" ? "text-green-600 dark:text-green-400 font-bold" : "text-red-600 dark:text-red-400 font-bold"}>
                        {movement.type === "IN" ? "+" : "-"}{movement.quantity} {movement.material.unit}
                      </span>
                    </TableCell>
                    <TableCell>{movement.user.name}</TableCell>
                    <TableCell>
                      {movement.notes ? (
                        <span className="truncate max-w-[150px] block">{movement.notes}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MovementDetailDialog
        movement={selectedMovement}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
