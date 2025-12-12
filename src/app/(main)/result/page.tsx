"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  CircleCheck,
  CircleX,
  Download,
  Share2,
  Home,
  Unlock,
  RefreshCcwIcon
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type CapsuleData = {
  id: string;
  title: string;
  code: string;
  email: string;
  openDate: string;
  location?: string;
};

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [capsuleData, setCapsuleData] = useState<CapsuleData | null>(null);

  const status = searchParams.get("status") as "success" | "failed" | null;
  const capsuleId = searchParams.get("id");

  useEffect(() => {
    if (status === "success" && capsuleId) {
      // Fetch capsule data from your storage/API
      // For now using mock data
      const data: CapsuleData = {
        id: capsuleId,
        title: "My Time Capsule",
        code: "ABC123",
        email: "user@example.com",
        openDate: "2025-12-31",
        location: "Jakarta, Indonesia"
      };
      setCapsuleData(data);
    }
  }, [status, capsuleId]);

  const handleDownloadInfo = () => {
    if (!capsuleData) return;

    const info = `
╔══════════════════════════════════════╗
║   EONA TIME CAPSULE INFORMATION      ║
╚══════════════════════════════════════╝

📦 Capsule Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Capsule ID    : ${capsuleData.id}
Title         : ${capsuleData.title}
Unlock Code   : ${capsuleData.code}
Email         : ${capsuleData.email}
Open Date     : ${new Date(capsuleData.openDate).toLocaleDateString()}
Location      : ${capsuleData.location || "Not specified"}

🔓 How to Unlock
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visit: ${window.location.origin}/unlock
2. Enter your email: ${capsuleData.email}
3. Enter your code: ${capsuleData.code}

⚠️  IMPORTANT: Keep this information safe!
    You will need the code to unlock your capsule.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Created with ❤️ by EONA
    `.trim();

    const blob = new Blob([info], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eona-capsule-${capsuleData.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Capsule information downloaded!");
  };

  const handleShare = async () => {
    if (!capsuleData) return;

    const shareText = `I just created a time capsule on EONA! 🕰️\nIt will open on ${new Date(
      capsuleData.openDate
    ).toLocaleDateString()}\n\nUnlock it at: ${window.location.origin}/unlock`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `EONA Time Capsule: ${capsuleData.title}`,
          text: shareText
        });
        toast.success("Shared successfully!");
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Information copied to clipboard!");
    }
  };

  // Redirect if no status
  if (!status) {
    router.push("/capsule");
    return null;
  }

  // Failed state
  if (status === "failed") {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto rounded-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 size-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <CircleX className="size-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Failed to Create Capsule</CardTitle>
            <CardDescription>
              Something went wrong while creating your time capsule. Please try
              again.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-2">
            <Button variant="glossy" className="flex-1" asChild>
              <Link href="/capsule">
                <RefreshCcwIcon />
                Try Again
              </Link>
            </Button>
            <Button variant="glossy-outline" className="flex-1" asChild>
              <Link href="/">
                <Home /> Back to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto rounded-2xl shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 size-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CircleCheck className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">
            Capsule Created Successfully!
          </CardTitle>
          <CardDescription>
            Your time capsule has been securely stored and will be available on{" "}
            <strong>
              {capsuleData?.openDate
                ? new Date(capsuleData.openDate).toLocaleDateString()
                : "the selected date"}
            </strong>
          </CardDescription>
        </CardHeader>

        {capsuleData && (
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Capsule ID
                </span>
                <span className="font-mono text-sm font-medium">
                  {capsuleData.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Title</span>
                <span className="text-sm font-medium">{capsuleData.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Unlock Code
                </span>
                <span className="font-mono text-sm font-bold text-primary">
                  {capsuleData.code}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{capsuleData.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Open Date</span>
                <span className="text-sm font-medium">
                  {new Date(capsuleData.openDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                ⚠️ Important: Save Your Unlock Code!
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                You will need your <strong>email</strong> and{" "}
                <strong>unlock code</strong> to access your capsule. Download
                the information file to keep it safe.
              </p>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="glossy"
            className="w-full"
            onClick={handleDownloadInfo}
            disabled={!capsuleData}
          >
            <Download /> Download Capsule Information
          </Button>
          <Button
            variant="glossy-secondary"
            className="w-full"
            onClick={handleShare}
            disabled={!capsuleData}
          >
            <Share2 /> Share
          </Button>
          <div className="flex gap-2 w-full">
            <Button variant="glossy-outline" className="flex-1" asChild>
              <Link href="/unlock">
                <Unlock />
                Unlock
              </Link>
            </Button>
            <Button variant="glossy-outline" className="flex-1" asChild>
              <Link href="/">
                <Home /> Home
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
