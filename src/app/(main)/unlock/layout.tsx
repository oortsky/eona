import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EONA - Let's go, open your capsule!"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
