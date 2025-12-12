import type { Metadata } from "next";
// import { ProtectedRoute } from "@/components/protected-route";

export const metadata: Metadata = {
  title: "EONA - Plant Your Capsule"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
