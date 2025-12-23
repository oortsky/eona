"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { MailIcon, Unlock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { openCapsule, getCapsule } from "@/lib/capsule";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Footprint } from "@/types/capsule";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().min(6, "Code must be at least 6 characters")
});

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      code: ""
    }
  });

  const getLocation = (): Promise<Footprint> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        error => {
          reject(error);
        }
      );
    });
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const capsuleResult = await getCapsule(data.email, "user_email");

      if (!capsuleResult.success || !capsuleResult.capsule) {
        toast.error("No capsule found for this email");
        setLoading(false);
        return;
      }

      const capsule = capsuleResult.capsule;

      let currentLocation: Footprint | undefined = undefined;

      if (capsule.footprint) {
        try {
          toast.loading("Getting your location...");
          currentLocation = await getLocation();
          toast.dismiss();
        } catch (error) {
          toast.dismiss();
          console.error("Failed to get location:", error);
          toast.error(
            "This capsule requires location access. Please enable location permissions."
          );
          setLoading(false);
          return;
        }
      }

      const result = await openCapsule(
        capsule.$id,
        "id",
        data.code,
        currentLocation
      );

      if (result.success) {
        toast.success("Capsule unlocked successfully!");
        router.push(`/capsule/${capsule.$id}`);
      } else {
        if (result.message === "Capsule already opened") {
          toast.info("This capsule has already been opened");
          router.push(`/capsule/${capsule.$id}`);
        } else if (result.message === "Capsule is still locked") {
          toast.error(
            `Capsule is still locked until ${
              result.lockedUntil
                ? format(new Date(result.lockedUntil), "EEEE, dd MMMM yyyy", {
                    locale: idLocale
                  })
                : "the designated time"
            }`
          );
        } else if (result.requiresLocation) {
          toast.error(result.message || "Location verification required");
          if (result.distance) {
            toast.info(
              `You are ${result.distance}m away from the designated location`
            );
          }
        } else {
          toast.error(result.message || "Failed to unlock capsule");
        }
      }
    } catch (error) {
      console.error("Unlock error:", error);
      toast.error("An error occurred while unlocking the capsule");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto flex flex-col justify-center items-center py-12 px-4 min-h-[100dvh]">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-logo tracking-widest drop-shadow-lg -mb-1 -mr-2 mb-4">
          EONA
        </h1>
        <p className="text-base font-mono font-bold tracking-wider">
          Unlock Your Time Capsule
        </p>
      </div>

      <Card className="w-full max-w-2xl rounded-2xl shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
        <CardHeader>
          <CardTitle>Unlock Capsule</CardTitle>
          <CardDescription>
            Enter your email and unlock code to access your time capsule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-unlock" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="unlock-email">
                      Email Address
                    </FieldLabel>
                    <InputGroup className="rounded-2xl">
                      <InputGroupInput
                        {...field}
                        id="unlock-email"
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                      />
                      <InputGroupAddon>
                        <MailIcon />
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      The email you used to create the capsule
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="unlock-code">Unlock Code</FieldLabel>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup className="flex-1 justify-between">
                        <InputOTPSlot
                          index={0}
                          className="w-10 h-10 text-base dark:bg-input/30 border rounded-2xl first:rounded-2xl first:border last:rounded-2xl"
                        />
                        <InputOTPSlot
                          index={1}
                          className="w-10 h-10 text-base dark:bg-input/30 border rounded-2xl first:rounded-2xl first:border last:rounded-2xl"
                        />
                        <InputOTPSlot
                          index={2}
                          className="w-10 h-10 text-base dark:bg-input/30 border rounded-2xl first:rounded-2xl first:border last:rounded-2xl"
                        />
                        <InputOTPSlot
                          index={3}
                          className="w-10 h-10 text-base dark:bg-input/30 border rounded-2xl first:rounded-2xl first:border last:rounded-2xl"
                        />
                        <InputOTPSlot
                          index={4}
                          className="w-10 h-10 text-base dark:bg-input/30 border rounded-2xl first:rounded-2xl first:border last:rounded-2xl"
                        />
                        <InputOTPSlot
                          index={5}
                          className="w-10 h-10 text-base dark:bg-input/30 border rounded-2xl first:rounded-2xl first:border last:rounded-2xl"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldDescription>
                      The code provided when you created the capsule
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            variant="glossy"
            className="w-full"
            type="submit"
            form="form-unlock"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner /> Unlocking...
              </>
            ) : (
              <>
                <Unlock /> Unlock Capsule
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}