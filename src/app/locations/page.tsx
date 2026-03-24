import { getLocations } from "@/actions/locations";
import { LocationList } from "@/components/locations/location-list";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { Suspense } from "react";
import LocationsLoading from "./loading";

async function LocationContent() {
  const locations = await getLocations();
  return <LocationList locations={locations} />
}

export default async function LocationsPage() {
  const session = await getSession();

  // If no session, redirect to login
  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent("/locations");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="space-y-6">
      <ScrollToTop />
      <Suspense fallback={<LocationsLoading />}>
        <LocationContent />
      </Suspense>

    </div>
  );
}