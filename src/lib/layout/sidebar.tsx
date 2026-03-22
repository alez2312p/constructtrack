"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { Package, LayoutDashboard, ArrowLeftRight, LogOut, Menu, Folder, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import React from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventario", icon: Package },
  { href: "/movements", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/categories", label: "Categorías", icon: Folder },
  { href: "/locations", label: "Ubicaciones", icon: MapPin },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b flex items-center justify-between px-4 h-14">
        <span className="font-bold text-lg">ConstructTrack</span>
        <MobileNav pathname={pathname} />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:bg-background md:border-r md:z-40">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <Package className="h-6 w-6" />
            <span className="font-bold text-lg">ConstructTrack</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t flex items-center justify-between">
            <ThemeToggle />
            <form action={logout}>
              <Button type="submit" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <div className="p-2 -mr-2 cursor-pointer">
          <Menu className="h-5 w-5" />
        </div>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader className="mb-4">
          <SheetTitle>Menú</SheetTitle>
        </SheetHeader>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t flex items-center justify-between">
            <ThemeToggle />
            <form action={logout}>
              <Button type="submit" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-5 w-5 mr-2" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
