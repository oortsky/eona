import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EONA - Terms of Service"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
