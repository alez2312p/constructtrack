"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { deleteMaterial } from "@/actions/materials";

import { Input } from "@/components/ui/input";
import { MaterialForm } from "@/components/inventory/material-form";
import { EmptyState } from "./EmptyState";
import { MaterialMobileCard } from "./MaterialMobileCard";
import { MaterialDesktopTable } from "./MaterialDesktopTable";
import { CommonProps, InventoryListProps } from "../../lib/type";
import DeleteMaterialModal from "./DeleteMaterialModal";
import { Button } from "../ui/button";
import { BatchImportModal } from "./batch-import-modal";
import { BatchQRPrintModal } from "./batch-qr-print-modal";
import { PhysicalInventoryPrintModal } from "./physical-inventory-print-modal";

export function InventoryList({
  materials,
  categories,
  locations,
  userId,
  initialSearch = "",
  initialFilter = ""
}: InventoryListProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState(initialFilter);

  const filteredMaterials = useMemo(() => {
    // Descomenta la siguiente línea para forzar el modo "sin productos" y ver el diseño
    // return [];
    return materials.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const isLow = m.currentStock <= m.minStock;
      if (filter === "low") return matchesSearch && isLow;
      if (filter === "empty") return matchesSearch && m.currentStock === 0;
      if (filter === "normal") return matchesSearch && !isLow;
      return matchesSearch;
    });
  }, [materials, search, filter]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const result = await deleteMaterial(deleteId);
    if (result.error) {
      setDeleteError(result.error);
      setDeleteLoading(false);
      return;
    }

    setDeleteId(null);
    setDeleteLoading(false);
    router.refresh();
  };


  const handleDeleteCancel = () => {
    setDeleteId(null);
    setDeleteError(null);
  };

  const commonProps: CommonProps = {
    userId,
    categories,
    locations,
    handleDelete: (id: string) => {
      setDeleteId(id);
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-88px)] md:h-[calc(100vh-20px)]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
        <div className="flex flex-wrap items-center gap-2">
          <PhysicalInventoryPrintModal
            materials={materials}
            categories={categories}
            locations={locations}
          />
          <BatchQRPrintModal materials={materials} />
          <BatchImportModal />
          <MaterialForm {...commonProps} />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materiales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 md:h-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "", label: "Todos", activeClass: "bg-primary text-primary-foreground" },
            { id: "empty", label: "Agotado", activeClass: "bg-red-600 text-white" },
            { id: "low", label: "Stock Bajo", activeClass: "bg-amber-500 text-white" },
            { id: "normal", label: "Normal", activeClass: "bg-green-600 text-white" }
          ].map((f) => (
            <Button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-4 py-1.5 rounded-full font-medium transition-all shrink-0 border",
                filter === f.id
                  ? f.activeClass
                  : "bg-muted/50 hover:bg-muted text-muted-foreground border-transparent"
              )}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile View (Scrollable Cards) */}
      <div className="md:hidden flex-1 overflow-y-auto space-y-3 ">
        {filteredMaterials.length === 0 ? (
          <EmptyState />
        ) : (
          filteredMaterials.map((m) => (
            <MaterialMobileCard key={m.id} material={m} {...commonProps} />
          ))
        )}
      </div>

      <MaterialDesktopTable materials={filteredMaterials} {...commonProps} />

      {/* Delete Confirmation Dialog */}
      <DeleteMaterialModal
        deleteId={!!deleteId}
        deleteLoading={deleteLoading}
        handleDeleteCancel={handleDeleteCancel}
        handleDeleteConfirm={handleDeleteConfirm}
      />

      {deleteError && (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-red-500 text-white rounded-md shadow-lg">
          {deleteError}
        </div>
      )}
    </div>
  );
}
