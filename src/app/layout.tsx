import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Sidebar } from "@/lib/layout/sidebar";
import { Shell } from "./shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConstructTrack",
  description: "Sistema de gestión de inventario de construcción",
};

import { getSession } from "@/lib/auth/get-session";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const isDemo = Boolean(session?.user?.isDemo);

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Shell sidebar={<Sidebar isDemo={isDemo} />} isDemo={isDemo}>
            {children}
          </Shell>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
