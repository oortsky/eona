import type { Metadata } from "next";
import { Geist, Geist_Mono, Workbench } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";

const workbench = Workbench({
  variable: "--font-workbench",
  subsets: ["latin"]
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "EONA - The Time Capsule",
  description: "Part of Axara Dev. & Powered by Appwrite."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="EONA" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${workbench.variable} font-sans`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
