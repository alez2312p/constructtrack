import { getProjects } from "@/actions/projects";
import { ProjectList } from "@/components/projects/project-list";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { Suspense } from "react";
import ProjectsLoading from "./loading";

async function ProjectsContent() {
  const projects = await getProjects();
  return <ProjectList projects={projects} />;
}

export default async function ProjectsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent("/projects");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="space-y-6">
      <ScrollToTop />
      <Suspense fallback={<ProjectsLoading />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}
