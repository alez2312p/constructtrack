"use server";

import { getSession } from "@/lib/auth/get-session";
import { resetDemoData } from "@/lib/demo/demo-store";
import { revalidatePath } from "next/cache";

export async function resetDemoAction() {
  const session = await getSession();
  if (!session?.user?.isDemo) {
    return { error: "No estás en modo demostración" };
  }

  await resetDemoData(session.user.demoSessionId);

  revalidatePath("/dashboard");
  revalidatePath("/inventory");
  revalidatePath("/movements");
  revalidatePath("/movements/history");
  revalidatePath("/categories");
  revalidatePath("/locations");

  return { success: true };
}
