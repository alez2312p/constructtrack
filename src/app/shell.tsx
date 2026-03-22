"use client";

import { usePathname } from "next/navigation";

interface ShellProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

export function Shell({ children, sidebar }: ShellProps) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <main className="min-h-screen">{children}</main>;
    }

    return (
        <main className="md:pl-64 min-h-screen">
            {sidebar}
            <div className="md:hidden h-14" />
            <div className="p-4 md:pb-0">{children}</div>
        </main>
    );
}
