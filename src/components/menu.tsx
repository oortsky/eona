"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  MenuIcon,
  X,
  Instagram,
  Twitter,
  Github,
  Coffee,
  LogOut,
  MessageCircleQuestion,
  Handshake,
  GlobeLock,
  Boxes,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Menu() {
  const [open, setOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Handle sign out
  async function handleSignOut() {
    try {
      setIsLoggingOut(true);
      await logout();
      setOpen(false);
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="glossy" size="icon-lg" aria-label="Toggle Menu">
          {open ? <X className="size-4" /> : <MenuIcon className="size-4" />}
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 py-1.5 max-h-fit overflow-y-auto relative overflow-hidden bg-background/10 backdrop-blur-xl border rounded-2xl mt-8 -ml-4 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 before:absolute before:top-[-50%] before:left-[-50%] before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] before:animate-liquid-slow before:pointer-events-none"
        align="start"
      >
        {isLoading ? (
          <DropdownMenuItem>
            <Spinner /> Loading...
          </DropdownMenuItem>
        ) : user ? (
          <DropdownMenuItem>
            <User /> <span className="line-clamp-1">{user.email}</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <User /> Guest
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="rounded-xl" asChild>
          <Link href="/intro">
            <Boxes /> Introduction
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl" asChild>
          <Link href="/faq">
            <MessageCircleQuestion /> FAQ
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl" asChild>
          <Link href="/privacy">
            <GlobeLock /> Privacy Policy
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl" asChild>
          <Link href="/terms">
            <Handshake /> Terms of Service
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="rounded-xl" asChild>
          <Link
            href="https://github.com/axara-dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github /> GitHub
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl" asChild>
          <Link
            href="https://x.com/weareaxara"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter /> X/Twitter
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl" asChild>
          <Link
            href="https://instagram.com/axara.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram /> Instagram
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl" asChild>
          <Link
            href="https://trakte.er/oortsky"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Coffee /> Trakteer
          </Link>
        </DropdownMenuItem>

        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="rounded-xl"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? <Spinner /> : <LogOut />}
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
