import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EONA - Your message from the past."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
