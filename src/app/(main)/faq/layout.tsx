import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EONA - FAQ"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
