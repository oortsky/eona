"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import {
  CircleCheck,
  CircleX,
  Home,
  Unlock,
  RefreshCcwIcon
} from "lucide-react";
import Link from "next/link";
import { getCapsule } from "@/lib/capsule";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Loading from "@/app/loading";
import type { Capsule } from "@/types/capsule";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [capsuleData, setCapsuleData] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get("status") as "success" | "failed" | null;
  const capsuleId = searchParams.get("id");

  useEffect(() => {
    const fetchCapsuleData = async () => {
      if (status === "success" && capsuleId) {
        setLoading(true);
        try {
          const result = await getCapsule(capsuleId, "id");
          if (result.success && result.capsule) {
            setCapsuleData(result.capsule);
          }
        } catch (error) {
          console.error("Failed to fetch capsule:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchCapsuleData();
  }, [status, capsuleId]);

  if (loading) {
    return <Loading />;
  }

  if (status) {
    switch (status) {
      case "success":
        const formattedDate = capsuleData?.locked_until
          ? format(new Date(capsuleData.locked_until), "EEEE, dd MMMM yyyy", {
              locale: idLocale
            })
          : "unavailable date";
          
        return (
          <Display
            status="success"
            title="Time Capsule Sealed!"
            description={`"${capsuleData?.name}" will open on ${formattedDate} for ${capsuleData?.user_email}.`}
          />
        );
      case "failed":
        return (
          <Display
            status="failed"
            title="Save Failed"
            description="Unable to create capsule. Please check your connection and retry."
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
  status: "success" | "failed";
}

function Display({ title, description, status }: DisplayProps) {
  const getIcon = () => {
    switch (status) {
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
      case "success":
        return (
          <div className="flex justify-center gap-4 items-center">
            <Button variant="glossy" size="sm" className="rounded-full" asChild>
              <Link href="/unlock">
                <Unlock className="size-4" />
                Unlock Capsule
              </Link>
            </Button>
            <Button
              variant="glossy-outline"
              size="sm"
              className="rounded-full"
              asChild
            >
              <Link href="/">
                <Home className="size-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        );
      case "failed":
        return (
          <div className="flex justify-center gap-4 items-center">
            <Button variant="glossy" size="sm" className="rounded-full" asChild>
              <Link href="/capsule">
                <RefreshCcwIcon className="size-4" />
                Try Again
              </Link>
            </Button>
            <Button
              variant="glossy-outline"
              size="sm"
              className="rounded-full"
              asChild
            >
              <Link href="/">
                <Home className="size-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        );
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
