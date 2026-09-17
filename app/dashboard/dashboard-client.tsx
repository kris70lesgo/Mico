"use client";

import { useRouter } from "next/navigation";
import MicoApp from "../mico-app";

/** Public, deliberately limited preview of the learning experience. */
export default function DashboardClient() {
  const router = useRouter();

  return (
    <MicoApp
      learner={{
        id: "mico-public-demo",
        name: "Demo learner",
        demo: true,
        onSignOut: () => router.push("/login"),
      }}
      onExplore={(concept) =>
        router.push(
          concept ? `/atlas?concept=${encodeURIComponent(concept)}` : "/atlas",
        )
      }
    />
  );
}
