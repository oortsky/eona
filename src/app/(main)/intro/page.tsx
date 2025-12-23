import React from "react";
import { reader } from "@/lib/keystatic";
import Image from "next/image";
import Markdoc from "@markdoc/markdoc";
import Link from "next/link";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CircleX, ChevronLeft } from "lucide-react";

export const revalidate = 60;

export default async function Page() {
  const entry = await reader.singletons.intro.read();

  if (!entry) {
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

  const { title, content, avatar } = entry;

  const { node } = await content();
  const errors = Markdoc.validate(node);
  if (errors.length) {
    console.error("Markdoc validation errors:", errors);
    throw new Error("Invalid Markdoc content");
  }

  const renderable = Markdoc.transform(node);

  return (
    <article className="container mx-auto px-4 py-12 w-full min-h-[100dvh]">
      <Button className="mb-6 p-0" variant="link" asChild>
        <Link href="/">
          <ChevronLeft /> Back to Home
        </Link>
      </Button>
      {avatar && (
        <div className="mb-6">
          <AspectRatio
            ratio={16 / 9}
            className="bg-muted rounded-lg overflow-hidden"
          >
            <Image
              src={`/images/${avatar}`}
              alt="EONA × Axara's Banner"
              fill
              className="object-cover transition-all hover:scale-105 duration-300"
              priority
            />
          </AspectRatio>
        </div>
      )}

      <h1 className="text-3xl font-black">{title}</h1>

      <Separator className="my-6" />

      <ScrollArea className="h-[600px] w-full">
        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6 prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5 prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-3 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-semibold prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6 prose-li:mb-1 prose-li:text-muted-foreground prose-code:text-sm prose-code:bg-muted prose-code:text-foreground prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-hr:border-border prose-hr:my-6 prose-em:italic prose-em:text-muted-foreground">
          {Markdoc.renderers.react(renderable, React)}
        </div>
      </ScrollArea>
    </article>
  );
}
