import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { Package, MapPin, Building2, Truck, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { Suspense } from "react";
import SettingsLoading from "./loading";

function SettingsContent() {
  const settingsSections = [
    {
      title: "Catálogos y Operación",
      items: [
        { label: "Categorías", description: "Administra las familias y clasificaciones de materiales", href: "/categories", icon: Package },
        { label: "Ubicaciones", description: "Administra los almacenes, estanterías y zonas de acopio", href: "/locations", icon: MapPin },
        { label: "Obras y Proyectos", description: "Control de frentes de obra y centros de costos de salida", href: "/projects", icon: Building2 },
        { label: "Proveedores", description: "Directorio de proveedores y trazabilidad de compras", href: "/suppliers", icon: Truck },
      ],
    },
    {
      title: "Control y Seguridad",
      items: [
        { label: "Usuarios y Roles", description: "Gestiona cuentas de usuario y permisos (Admin, Operador, Auditor)", href: "/settings/users", icon: Users },
        { label: "Pista de Auditoría", description: "Historial completo e inmutable de eventos y cambios", href: "/settings/audit", icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
      {settingsSections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            {section.items.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default async function SettingsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent("/settings");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="space-y-6">
      <ScrollToTop />
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Configuración</h1>
      </div>
      <Suspense fallback={<SettingsLoading />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}