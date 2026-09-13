"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isDemoPending, setIsDemoPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const formEl = e.currentTarget as HTMLFormElement;
      const honeypot = (formEl.querySelector<HTMLInputElement>('input[name="honeypot"]'))?.value;
      if (honeypot) {
        setError("Error inesperado.");
        setIsPending(false);
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        // Try to parse JSON error
        let data;
        try {
          data = await res.json();
        } catch {
          // fallback to text
          const txt = await res.text();
          data = { error: txt || "Error desconocido" };
        }
        setError(data.error ?? "Error desconocido");
        return;
      }

      const data = await res.json();
      if (data.success) {
        // Determine target URL: prefer callbackUrl prop, fallback to data.redirectTo, then dashboard
        const target =
          callbackUrl && callbackUrl.startsWith("/")
            ? callbackUrl
            : data.redirectTo
              ? data.redirectTo
              : "/dashboard";
        // Use window.href to cause a full navigation (cookies already set in response)
        window.location.href = target;
        return;
      }

      setError(data.error ?? "Inicio de sesión fallido");
    } catch (err) {
      console.error(err);
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setIsDemoPending(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error desconocido" }));
        setError(data.error || "No se pudo iniciar la demo");
        return;
      }

      const data = await res.json();
      if (data.success) {
        const target =
          callbackUrl && callbackUrl.startsWith("/")
            ? callbackUrl
            : data.redirectTo
              ? data.redirectTo
              : "/dashboard";
        window.location.href = target;
        return;
      }

      setError(data.error || "Error al acceder a la demo");
    } catch (err) {
      console.error(err);
      setError("Error al conectar con la demo. Inténtalo de nuevo.");
    } finally {
      setIsDemoPending(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail("demo@constructtrack.com");
    setPassword("demo123");
    setError("");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">ConstructTrack</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field para atrapar bots */}
          <input
            type="text"
            name="honeypot"
            className="absolute opacity-0 h-0 w-0 -z-10"
            tabIndex={-1}
            autoComplete="off"
          />
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending || isDemoPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar Sesión
          </Button>
        </form>

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
            onClick={handleDemoLogin}
            disabled={isPending || isDemoPending}
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
              onClick={handleFillDemoCredentials}
              className="text-primary hover:underline whitespace-nowrap ml-2 cursor-pointer"
            >
              Llenar demo
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}