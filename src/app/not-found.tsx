import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia
} from "@/components/ui/empty";
import { FileX } from "lucide-react";

export const metadata: Metadata = {
  title: "EONA - Not Found"
};

export default function NotFound() {
  return (
    <Empty className="container mx-auto py-12 px-4">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileX />
        </EmptyMedia>
        <EmptyTitle>404 - Not Found</EmptyTitle>
        <EmptyDescription>
          The page you&apos;re looking for doesn&apos;t exist.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="glossy" size="sm" className="rounded-full" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
