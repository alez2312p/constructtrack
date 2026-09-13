"use client";

import { usePathname } from "next/navigation";
import { DemoBanner } from "@/components/layout/demo-banner";

interface ShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  isDemo?: boolean;
}

export function Shell({ children, sidebar, isDemo }: ShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {sidebar}
      <div className="md:pl-64 flex-1 flex flex-col">
        <div className="md:hidden h-14" />
        {isDemo && <DemoBanner />}
        <main className="p-4 md:pb-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
