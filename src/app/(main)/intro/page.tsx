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
      <Empty className="container mx-auto py-12 px-4 w-full min-h-screen">
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
    <article className="container mx-auto px-4 py-36 w-full min-h-screen">
      <Button className="mb-6 p-0" variant="link" asChild>
        <Link href="/">
          <ChevronLeft /> Back to Home
        </Link>
      </Button>
      {/* Avatar */}
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

      {/* Header */}
      <h1 className="text-3xl font-black">{title}</h1>

      <Separator className="my-6" />

      {/* Content */}
      <ScrollArea className="max-h-[400px] w-full">
        {Markdoc.renderers.react(renderable, React)}
      </ScrollArea>
    </article>
  );
}
