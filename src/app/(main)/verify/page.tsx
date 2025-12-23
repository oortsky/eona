"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Clock, CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";
import { pluralize } from "@/utils/pluralize";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";

export default function Page() {
  const { verifyMagicLink } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const hasVerified = useRef(false);

  const status = searchParams.get("status") as
    | "waiting"
    | "success"
    | "failed"
    | null;
  const secret = searchParams.get("secret");
  const userId = searchParams.get("userId");

  const handleRedirect = async () => {
    try {
      const response = await fetch("/api/auth/get-token");
      const data = await response.json();

      if (!data.token) {
        throw new Error("Verification token not found");
      }

      await fetch("/api/auth/delete-token", {
        method: "DELETE"
      });

      router.push("/capsule");
    } catch (error) {
      console.error("Failed to verify token:", error);
    }
  };

  useEffect(() => {
    if (secret && userId && !hasVerified.current) {
      hasVerified.current = true;

      const verify = async () => {
        try {
          await verifyMagicLink(userId, secret);
          router.push("/verify?status=success");
        } catch (error) {
          console.error("Verification failed:", error);
          router.push("/verify?status=failed");
        }
      };

      verify();
    }
  }, [secret, userId, verifyMagicLink, router]);

  useEffect(() => {
    if (status !== "success") return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(c => Math.max(0, c - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      handleRedirect();
    }
  }, [status, countdown]);

  if (secret && userId && !status) {
    return (
      <Display
        status="process"
        title="Authenticating"
        description="We're securely verifying your magic link. This will only take a moment..."
      />
    );
  }

  if (status) {
    switch (status) {
      case "waiting":
        return (
          <Display
            status="waiting"
            title="Magic Link Sent!"
            description="We've sent a secure sign-in link to your email address. Please check your inbox and click the link to continue."
          />
        );
      case "success":
        return (
          <Display
            status="success"
            title="Welcome Back!"
            description={`Authentication successful! Redirecting you to your capsule in ${countdown} ${pluralize(
              countdown,
              "second",
              "seconds"
            )}...`}
            onRedirect={handleRedirect}
          />
        );
      case "failed":
        return (
          <Display
            status="failed"
            title="Authentication Failed"
            description="This magic link has expired or is invalid. Please request a new sign-in link and try again."
          />
        );
      default:
        return null;
    }
  }

  return null;
}

interface DisplayProps {
  title: string;
  description: string;
  status: "waiting" | "process" | "success" | "failed";
  onRedirect?: () => void;
}

function Display({ title, description, status, onRedirect }: DisplayProps) {
  const getIcon = () => {
    switch (status) {
      case "waiting":
        return <Clock className="size-8 text-blue-600 dark:text-blue-400" />;
      case "process":
        return <Spinner className="size-8" />;
      case "success":
        return (
          <CircleCheck className="size-8 text-green-600 dark:text-green-400" />
        );
      case "failed":
        return <CircleX className="size-8 text-red-600 dark:text-red-400" />;
    }
  };

  const getAction = () => {
    switch (status) {
      case "waiting":
        return (
          <div className="flex flex-col gap-4 items-center">
            <Button variant="glossy" size="sm" className="rounded-full" asChild>
              <Link href="mailto:">Open Email App</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Didn't receive it?{" "}
              <Link href="/" className="underline hover:text-foreground">
                Try again
              </Link>
            </p>
          </div>
        );
      case "success":
        return (
          <Button
            variant="glossy"
            size="sm"
            className="rounded-full"
            onClick={onRedirect}
          >
            Go to Capsule Now
          </Button>
        );
      case "failed":
        return (
          <div className="flex flex-col gap-4 items-center">
            <Button variant="glossy" size="sm" className="rounded-full" asChild>
              <Link href="/">Request New Link</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link href="/support" className="underline hover:text-foreground">
                Contact support
              </Link>
            </p>
          </div>
        );
      case "process":
        return null;
    }
  };

  return (
    <Empty className="container mx-auto py-12 px-4 w-full min-h-[100dvh]">
      <EmptyHeader>
        <EmptyMedia className="rounded-full size-16" variant="icon">
          {getIcon()}
        </EmptyMedia>
        <EmptyTitle className="text-2xl">{title}</EmptyTitle>
        <EmptyDescription className="text-base max-w-md mx-auto">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{getAction()}</EmptyContent>
    </Empty>
  );
}
