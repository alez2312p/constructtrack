"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { DemoLoginSection } from "./demo-login-section";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isDemoPending, setIsDemoPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const formEl = e.currentTarget as HTMLFormElement;
      const honeypot = formEl.querySelector<HTMLInputElement>('input[name="honeypot"]')?.value;
      if (honeypot) {
        setError("Error inesperado.");
        setIsPending(false);
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let data;
        try {
          data = await res.json();
        } catch {
          const txt = await res.text();
          data = { error: txt || "Error desconocido" };
        }
        setError(data.error ?? "Error desconocido");
        return;
      }

      const data = await res.json();
      if (data.success) {
        const target = callbackUrl?.startsWith("/") ? callbackUrl : data.redirectTo || "/dashboard";
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
        const target = callbackUrl?.startsWith("/") ? callbackUrl : data.redirectTo || "/dashboard";
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
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending || isDemoPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar Sesión
          </Button>
        </form>

        <DemoLoginSection
          onDemoLogin={handleDemoLogin}
          onFillDemoCredentials={handleFillDemoCredentials}
          disabled={isPending || isDemoPending}
          isDemoPending={isDemoPending}
        />
      </CardContent>
    </Card>
  );
}