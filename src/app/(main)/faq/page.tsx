import React from "react";
import { reader } from "@/lib/keystatic";
import Markdoc from "@markdoc/markdoc";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Card, CardContent } from "@/components/ui/card";
import { FAQs } from "@/components/faqs";
import { MessageCircleQuestion, CircleX, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export default async function Page() {
  const entry = await reader.singletons.faq.read();

  if (!entry || !entry.items || entry.items.length === 0) {
    return (
      <Empty className="container mx-auto py-12 px-4 w-full min-h-[100dvh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleX />
          </EmptyMedia>
          <EmptyTitle>Unavailable</EmptyTitle>
          <EmptyDescription>
            This page is currently unavailable, please try again later.
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

  const parsedFAQs = await Promise.all(
    entry.items.map(async item => {
      const { node } = await item.answer();

      const transformed = Markdoc.transform(node);

      const html = Markdoc.renderers.html(transformed);

      return {
        question: item.question,
        html
      };
    })
  );

  return (
    <div className="container mx-auto px-4 py-12 w-full min-h-[100dvh]">
      {/* Header */}
      <Button className="mb-2 p-0" variant="link" asChild>
        <Link href="/">
          <ChevronLeft /> Back to Home
        </Link>
      </Button>
      <h1 className="text-3xl font-black mb-2">FAQ</h1>
      <p className="text-sm text-muted-foreground font-mono">
        A collection of frequently asked questions.
      </p>

      {/* Separator */}
      <Separator className="my-6" />
      <FAQs faqs={parsedFAQs} />
    </div>
  );
}
