"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
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

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">ConstructTrack</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
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
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar Sesión
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}