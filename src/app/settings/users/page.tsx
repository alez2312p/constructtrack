import { getUsers } from "@/actions/users";
import { UserManagement } from "@/components/users/user-management";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { Suspense } from "react";
import UsersLoading from "./loading";

async function UsersContent({ currentUserId, currentUserRole }: { currentUserId: string; currentUserRole: string }) {
  const users = await getUsers();
  return (
    <UserManagement
      initialUsers={users}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
    />
  );
}

export default async function UsersPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent("/settings/users");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="space-y-6">
      <ScrollToTop />
      <Suspense fallback={<UsersLoading />}>
        <UsersContent
          currentUserId={session.user.id}
          currentUserRole={session.user.role || "OPERATOR"}
        />
      </Suspense>
    </div>
  );
}
