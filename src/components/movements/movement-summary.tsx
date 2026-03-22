import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MovementSummaryProps {
  totalIn: number;
  totalOut: number;
}

export function MovementSummary({ totalIn, totalOut }: MovementSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 flex-1">
      <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-green-700 dark:text-green-400">Entradas</p>
              <p className="text-xl font-bold text-green-800 dark:text-green-300">
                {totalIn || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-full">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-red-700 dark:text-red-400">Salidas</p>
              <p className="text-xl font-bold text-red-800 dark:text-red-300">
                {totalOut || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
