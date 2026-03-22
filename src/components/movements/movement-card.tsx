"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpLeft, ArrowDownLeft } from "lucide-react";
import { MovementData } from "@/lib/type";
import Badges from "./badges";
import DialogDetailsMovement from "./dialog-details-movement";

interface MovementItemProps {
  movement: MovementData;
  variant?: "list" | "card";
}

export function MovementItem({ movement, variant = "list" }: MovementItemProps) {
  const [open, setOpen] = useState(false);
  const isIn = movement.type === "IN";
  const colorClass = isIn ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  const Icon = isIn ? ArrowUpLeft : ArrowDownLeft;

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {variant === "list" ? (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <Icon className={`h-5 w-5 shrink-0 ${colorClass}`} />
              <div className="min-w-0">
                <p className="font-medium truncate">{movement.material.name}</p>
                <div className="flex items-center gap-2">
                  <Badges movement={movement} />
                </div>
              </div>
            </div>
            <div className="text-right ml-2">
              <p className={`font-bold ${colorClass}`}>
                {isIn ? "+" : "-"}{movement.quantity} {movement.material.unit}
              </p>
              <p className="text-base text-muted-foreground mt-1">
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
        ) : (
          <Card className="hover:bg-muted/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`h-5 w-5 shrink-0 ${colorClass}`} />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{movement.material.name}</p>
                    <Badges movement={movement} />
                  </div>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <Badge variant={isIn ? "default" : "destructive"}>
                    {isIn ? "Entrada" : "Salida"}
                  </Badge>
                  <p className={`font-bold mt-1 ${colorClass}`}>
                    {isIn ? "+" : "-"}{movement.quantity} {movement.material.unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <DialogDetailsMovement open={open} setOpen={setOpen} colorClass={colorClass} icon={Icon} isIn={isIn} movement={movement} />
    </>
  );
}


