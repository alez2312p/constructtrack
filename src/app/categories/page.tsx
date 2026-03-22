import { getCategories } from "@/actions/categories";
import { CategoryList } from "@/components/categories/category-list";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { Suspense } from "react";
import CategoriesLoading from "./loading";

async function CategoriesContent() {
  const categories = await getCategories();
  return <CategoryList categories={categories} />;
}

export default async function CategoriesPage() {
  const session = await getSession();

  // If no session, redirect to login
  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent("/categories");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="space-y-6">
      <ScrollToTop />
      <Suspense fallback={<CategoriesLoading />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}