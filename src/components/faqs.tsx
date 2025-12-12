"use client";

import React, { useState, useMemo } from "react";
import Markdoc from "@markdoc/markdoc";
import type { RenderableTreeNode } from "@markdoc/markdoc";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Search, SearchX } from "lucide-react";

interface FAQs {
  question: string;
  html: string;
}

export function FAQs({ faqs }: { faqs: FAQs[] }) {
  const [query, setQuery] = useState("");

  const filteredFAQs = useMemo(() => {
    if (!query.trim()) return faqs;

    const searchTerm = query.toLowerCase();
    return faqs.filter(faq => faq.question.toLowerCase().includes(searchTerm));
  }, [query, faqs]);

  return (
    <Card>
      <CardHeader>
        {/* Search */}
        <InputGroup
          data-empty={!query}
          className="flex-1 rounded-full [&[data-empty=true]_*]:text-muted-foreground [&:not([data-empty=true])_*]:text-foreground"
        >
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search FAQ..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </InputGroup>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[300px] w-full">
          {filteredFAQs.length === 0 ? (
            <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyDescription>
                  No FAQ matches your search for &quot;{query}&quot;
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="w-full rounded-2xl px-3 bg-muted/20 border"
                >
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <div dangerouslySetInnerHTML={{ __html: faq.html }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
