"use client";

import { useState, useMemo } from "react";
import { AuditLogItem } from "@/actions/audit";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ShieldCheck, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface AuditLogViewProps {
  logs: AuditLogItem[];
}

export function AuditLogView({ logs }: AuditLogViewProps) {
  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase();
      const action = log.action.toLowerCase();
      const entity = log.entity.toLowerCase();
      const details = (log.details || "").toLowerCase();
      const userName = (log.user?.name || "").toLowerCase();
      return (
        action.includes(q) ||
        entity.includes(q) ||
        details.includes(q) ||
        userName.includes(q)
      );
    });
  }, [logs, search]);

  const exportAuditExcel = () => {
    if (filteredLogs.length === 0) {
      toast.warning("No hay registros para exportar");
      return;
    }

    const data = filteredLogs.map((log) => ({
      Fecha: new Date(log.createdAt).toLocaleString("es-ES"),
      Acción: log.action,
      Entidad: log.entity,
      Detalles: log.details || "",
      Usuario: log.user?.name || "Sistema / Demo",
      Email: log.user?.email || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoría");
    XLSX.writeFile(workbook, `auditoria_constructtrack_${Date.now()}.xlsx`);
    toast.success("Log de auditoría exportado");
  };

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE") || action === "STOCK_IN" || action.includes("IMPORT")) {
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300">{action}</Badge>;
    }
    if (action.includes("DELETE") || action === "STOCK_OUT") {
      return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-300">{action}</Badge>;
    }
    if (action.includes("UPDATE")) {
      return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300">{action}</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Pista de Auditoría
            </h1>
            <p className="text-sm text-muted-foreground">
              Registro inmutable de acciones, modificaciones y trazabilidad de inventario
            </p>
          </div>
        </div>

        <Button onClick={exportAuditExcel} variant="outline" className="gap-2 shrink-0">
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filtrar por acción, entidad, detalles o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron eventos de auditoría
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="font-mono text-xs">{log.entity}</TableCell>
                    <TableCell className="text-xs max-w-xs sm:max-w-md truncate">
                      {log.details || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium">{log.user?.name || "Sistema"}</span>
                      {log.user?.email && (
                        <span className="text-muted-foreground block text-[10px]">
                          {log.user.email}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
