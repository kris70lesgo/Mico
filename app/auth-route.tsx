"use client";

import { useRouter } from "next/navigation";
import MicoAuth from "./mico-auth";

export default function AuthRoute() {
  const router = useRouter();
  return <MicoAuth onDemo={() => router.push("/dashboard?demo=1")} />;
}
