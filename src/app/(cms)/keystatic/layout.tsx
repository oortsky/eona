import type { Metadata } from "next";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "Cleanify - Dashboard CMS",
  description: "Dashboard for Cleanify's Content Management System."
};

export default function Layout() {
  return <KeystaticApp />;
}
