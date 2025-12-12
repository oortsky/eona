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
import { MailIcon, KeyRound, Unlock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().min(6, "Code must be at least 6 characters")
});

export default function UnlockPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      code: ""
    }
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // TODO: Implement unlock logic
      // Verify email + code with your backend
      // const response = await fetch('/api/unlock', {
      //   method: 'POST',
      //   body: JSON.stringify(data)
      // });

      // Mock success for now
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success("Capsule unlocked successfully!");
      // Redirect to capsule content page
      // router.push(`/capsule/${capsuleId}`);
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto flex flex-col justify-center items-center py-12 px-4 min-h-screen">
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
            {loading ? <Spinner /> : <Unlock />} Unlock Capsule
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
