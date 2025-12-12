"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Timer, CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";

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

interface DisplayProps {
  title: string;
  description: string;
  status: "waiting" | "success" | "failed";
  countdown?: number;
}

function Display({ title, description, status, countdown }: DisplayProps) {
  const getIcon = () => {
    switch (status) {
      case "waiting":
        return <Timer />;
      case "success":
        return <CircleCheck />;
      case "failed":
        return <CircleX />;
    }
  };

  const getAction = () => {
    switch (status) {
      case "waiting":
        return (
          <Button variant="glossy" size="sm" className="rounded-full" asChild>
            <Link href="mailto:?">Go to Email</Link>
          </Button>
        );
      case "success":
        return (
          <div className="flex flex-col items-center gap-2">
            {countdown !== undefined && countdown > 0 && (
              <p className="text-sm text-muted-foreground">
                Redirecting in {countdown} seconds...
              </p>
            )}
            <Button variant="glossy" size="sm" className="rounded-full" asChild>
              <Link href="/capsule">Go to Capsule</Link>
            </Button>
          </div>
        );
      case "failed":
        return (
          <Button variant="glossy" size="sm" className="rounded-full" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        );
    }
  };

  return (
    <Empty className="container mx-auto py-12 px-4 w-full min-h-screen">
      <EmptyHeader>
        <EmptyMedia variant="icon">{getIcon()}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{getAction()}</EmptyContent>
    </Empty>
  );
}

export default function Page() {
  const { verifyMagicLink, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [isVerifying, setIsVerifying] = useState(false);

  const status = searchParams.get("status") as
    | "waiting"
    | "success"
    | "failed"
    | null;
  const secret = searchParams.get("secret");
  const userId = searchParams.get("userId");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && status !== "success") {
      router.push("/capsule");
    }
  }, [isAuthenticated, status, router]);

  // Handle magic link verification
  useEffect(() => {
    if (secret && userId && !isVerifying) {
      setIsVerifying(true);

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
  }, [secret, userId, verifyMagicLink, router, isVerifying]);

  // Auto redirect on success
  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/capsule");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, router]);

  // Show verifying state
  if (secret && userId) {
    return (
      <Empty className="container mx-auto py-12 px-4">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>Verifying...</EmptyTitle>
          <EmptyDescription>
            Please wait while we verify your magic link.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // Handle status display
  if (status) {
    switch (status) {
      case "waiting":
        return (
          <Display
            status="waiting"
            title="Check Your Email"
            description="We've sent a magic link to your email. Click the link to sign in."
          />
        );
      case "success":
        return (
          <Display
            status="success"
            title="Success!"
            description="You've been signed in successfully. You can now access your capsule."
            countdown={countdown}
          />
        );
      case "failed":
        return (
          <Display
            status="failed"
            title="Verification Failed"
            description="The magic link is invalid or has expired. Please try again."
          />
        );
      default:
        router.push("/");
        return null;
    }
  }

  // Default: redirect to home if no params
  router.push("/");
  return null;
}
