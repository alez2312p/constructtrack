import { LoginForm } from "@/components/auth/login-form";
import { Package } from "lucide-react";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl = "/dashboard" } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ConstructTrack</h1>
          <p className="text-sm text-muted-foreground">Sistema de Gestión de Inventario</p>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
} 