import type { Metadata } from "next";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "EONA - Dashboard CMS",
  description: "Dashboard for EONA's Content Management System."
};

export default function Layout() {
  return <KeystaticApp />;
}
