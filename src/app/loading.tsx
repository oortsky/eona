import type { Metadata } from "next";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "EONA - Loading...",
};

export default function Loading() {
  return (
    <main className="w-full min-h-screen flex items-center justify-center">
      <Spinner className="size-6" />
    </main>
  );
}
