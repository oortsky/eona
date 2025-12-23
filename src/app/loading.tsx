import type { Metadata } from "next";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "EONA - Loading...",
};

export default function Loading() {
  return (
    <main className="container w-full min-h-[100dvh] mx-auto flex items-center justify-center">
      <Spinner className="size-8" />
    </main>
  );
}
