import { getAuditLogs } from "@/actions/audit";
import { AuditLogView } from "@/components/audit/audit-log-view";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { Suspense } from "react";
import AuditLoading from "./loading";

async function AuditContent() {
  const logs = await getAuditLogs(100);
  return <AuditLogView logs={logs} />;
}

export default async function AuditPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent("/settings/audit");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="space-y-6">
      <ScrollToTop />
      <Suspense fallback={<AuditLoading />}>
        <AuditContent />
      </Suspense>
    </div>
  );
}
