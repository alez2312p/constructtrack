import { getSuppliers } from "@/actions/suppliers";
import { SupplierList } from "@/components/suppliers/supplier-list";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { Suspense } from "react";
import SuppliersLoading from "./loading";

async function SuppliersContent() {
  const suppliers = await getSuppliers();
  return <SupplierList suppliers={suppliers} />;
}

export default async function SuppliersPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent("/suppliers");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="space-y-6">
      <ScrollToTop />
      <Suspense fallback={<SuppliersLoading />}>
        <SuppliersContent />
      </Suspense>
    </div>
  );
}
