"use server";

import { prisma } from "@/lib/prisma";
import { assertSession } from "@/lib/auth/assert-session";
import { getSession } from "@/lib/auth/get-session";
import { getDemoAuditLogs, logDemoAudit } from "@/lib/demo/demo-store";

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  userId: string | null;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export async function logAuditEvent(
  action: string,
  entity: string,
  entityId?: string | null,
  details?: string | null,
  userId?: string | null
) {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      await logDemoAudit(
        session.user.demoSessionId,
        action,
        entity,
        entityId,
        details,
        userId ?? session.user.id
      );
      return;
    }

    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId: entityId ?? null,
        details: details ?? null,
        userId: userId ?? session?.user?.id ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

export async function getAuditLogs(limit: number = 100): Promise<AuditLogItem[]> {
  try {
    const session = await assertSession();

    if (session.user.isDemo) {
      const demoLogs = await getDemoAuditLogs(session.user.demoSessionId);
      return demoLogs.slice(0, limit) as AuditLogItem[];
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return logs as AuditLogItem[];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}
