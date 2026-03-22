import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { Package, MapPin } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { Suspense } from "react";
import SettingsLoading from "./loading";

function SettingsContent() {
  const settingsSections = [
    {
      title: "Gestión de Datos",
      items: [
        { label: "Categorías", description: "Administra las categorías de materiales", href: "/categories", icon: Package },
        { label: "Ubicaciones", description: "Administra las ubicaciones de almacenaje", href: "/locations", icon: MapPin },
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