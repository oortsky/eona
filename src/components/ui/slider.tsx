"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--background)/0.4),0_4px_8px_hsl(var(--background)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_10px_28px_hsl(var(--background)/0.45),0_6px_12px_hsl(var(--background)/0.25),inset_0_1px_0_rgba(255,255,255,0.3)] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/25 before:to-transparent before:pointer-events-none transition-colors focus-visible:outline-none focus-visible:scale-[1.2] disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
