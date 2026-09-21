"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface DemoLoginSectionProps {
  onDemoLogin: () => void;
  onFillDemoCredentials: () => void;
  disabled: boolean;
  isDemoPending: boolean;
}

export const DemoLoginSection: React.FC<DemoLoginSectionProps> = ({
  onDemoLogin,
  onFillDemoCredentials,
  disabled,
  isDemoPending,
}) => {
  return (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">O</span>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-amber-500/50 hover:border-amber-500 hover:bg-amber-500/10 text-foreground flex items-center justify-center gap-2 cursor-pointer"
          onClick={onDemoLogin}
          disabled={disabled}
        >
          {isDemoPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-amber-500" />
          )}
          Probar Demo
        </Button>

        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pt-1">
          <span>Explora datos de prueba sin alterar la base de datos</span>
          <button
            type="button"
            onClick={onFillDemoCredentials}
            className="text-primary hover:underline whitespace-nowrap ml-2 cursor-pointer"
          >
            Llenar demo
          </button>
        </div>
      </div>
    </>
  );
};
