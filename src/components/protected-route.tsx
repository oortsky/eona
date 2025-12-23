"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/app/loading";
import { getCapsule } from "@/lib/capsule";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireNoCapsule?: boolean;
  requireHasCapsule?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireNoCapsule = false,
  requireHasCapsule = false
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [checkingCapsule, setCheckingCapsule] = useState(
    requireNoCapsule || requireHasCapsule
  );
  const [hasCapsule, setHasCapsule] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const checkCapsule = async () => {
      if ((!requireNoCapsule && !requireHasCapsule) || !isAuthenticated || !user?.$id) {
        setCheckingCapsule(false);
        return;
      }

      setCheckingCapsule(true);
      try {
        const result = await getCapsule(user.$id, "user_id");
        const capsuleExists = result.success && result.capsule;
        setHasCapsule(!!capsuleExists);

        if (requireNoCapsule && capsuleExists) {
          router.push("/");
        } else if (requireHasCapsule && !capsuleExists) {
          router.push("/capsule");
        }
      } catch (error) {
        console.error("Failed to check capsule:", error);
      } finally {
        setCheckingCapsule(false);
      }
    };

    checkCapsule();
  }, [requireNoCapsule, requireHasCapsule, isAuthenticated, user?.$id, router]);

  if (isLoading || checkingCapsule) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireNoCapsule && hasCapsule) {
    return null;
  }

  if (requireHasCapsule && !hasCapsule) {
    return null;
  }

  return <>{children}</>;
}