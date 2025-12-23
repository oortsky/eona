import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/protected-route";

export const metadata: Metadata = {
  title: "EONA - Was it successfully created?"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireHasCapsule={true}>{children}</ProtectedRoute>;
}
