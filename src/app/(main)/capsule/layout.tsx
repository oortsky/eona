import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EONA - Ready to plant your capsule?"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
