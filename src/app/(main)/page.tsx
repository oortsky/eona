"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useCountdown } from "@/hooks/use-countdown";
import { useAuth } from "@/contexts/auth-context";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
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
  FieldLabel,
  FieldSet
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group";
import { Countdown } from "@/components/countdown";
import Image from "next/image";
import Link from "next/link";
import { pluralize } from "@/utils/pluralize";
import { toast } from "sonner";
import { MailIcon, Send } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  agree: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms of Service and Privacy Policy"
  })
});

export default function Home() {
  const { sendMagicLink, isAuthenticated } = useAuth();
  const router = useRouter();
  const { isOpen } = useCountdown();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      agree: false
    },
    mode: "onSubmit"
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/capsule");
    }
  }, [isAuthenticated, router]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // Uncomment if you want to check countdown
    // if (!isOpen) {
    //   toast.error("Time capsule creation is currently closed");
    //   return;
    // }

    setLoading(true);
    try {
      await sendMagicLink(
        data.email,
        `${process.env.NEXT_PUBLIC_BASE_URL}/verify`
      );

      // Navigate to waiting page
      router.push("/verify?status=waiting");

      // Show success message
      toast.success("Magic link sent! Check your email.");

      // Reset form
      form.reset();
    } catch (error) {
      console.error(error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send magic link. Please try again.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto container flex flex-col justify-center items-center py-36 px-4 w-full min-h-screen">
      <Countdown />
      <div className="my-28 text-center">
        <h1 className="text-8xl font-logo tracking-widest drop-shadow-lg -mb-1.5 -mr-2.5 mb-2">
          EONA
        </h1>
        <p className="text-base font-mono font-bold tracking-wider">
          The Time Capsule
        </p>
      </div>
      <div className="inline-flex gap-1.5 text-center text-sm mb-8">
        <p>Powered by</p>
        <Link
          href="https://appwrite.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            alt="Appwrite logo"
            src="/appwrite-logotype-dark.svg"
            width={100}
            height={14}
            className="hidden dark:block"
            priority
          />
          <Image
            alt="Appwrite logo"
            src="/appwrite-logotype-light.svg"
            width={100}
            height={14}
            className="block dark:hidden"
            priority
          />
        </Link>
      </div>
      <p className="w-full max-w-md text-xs font-mono text-center mb-12">
        <strong>EONA</strong> is a digital time-capsule platform with
        geo-location based that stores messages, photos, and videos, or even
        audio to be opened at a chosen future moment. Rooted in the word{" "}
        <em>eon</em>, it offers a modern and secure way to send memories forward
        in time.
      </p>

      <Separator />

      {/* Available Quota Time Capsule Left */}
      <div className="mt-12">
        <h2 className="text-xl text-center font-semibold mb-2">
          Available Quota
        </h2>
        <p className="text-6xl text-center font-bold mb-2">1000</p>
        <p className="text-lg text-center font-light">
          {pluralize(1000, "Capsule", "Capsules")}
        </p>
      </div>

      {/* Card - Email for Magic Link */}
      <Card className="mt-12 w-full max-w-2xl rounded-2xl shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
        <CardHeader>
          <CardTitle>Sign In to Create Your Capsule</CardTitle>
          <CardDescription>
            Enter your email to receive a secure sign-in link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-signin" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-signin-input-email">
                      Email Address
                    </FieldLabel>
                    <InputGroup className="rounded-2xl">
                      <InputGroupInput
                        {...field}
                        id="form-signin-input-email"
                        aria-invalid={fieldState.invalid}
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                      />
                      <InputGroupAddon>
                        <MailIcon />
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      We'll send you a magic link to sign in securely without a
                      password.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="agree"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FieldSet data-invalid={fieldState.invalid}>
                    <FieldGroup data-slot="checkbox-group">
                      <Field orientation="horizontal">
                        <Checkbox
                          id="form-signin-checkbox-agree"
                          name={field.name}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldLabel
                          htmlFor="form-signin-checkbox-agree"
                          className="inline font-normal"
                        >
                          I agree to the{" "}
                          <Link
                            href="/terms"
                            rel="noopener noreferrer"
                            className="no-underline hover:underline"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            rel="noopener noreferrer"
                            className="no-underline hover:underline"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </FieldLabel>
                      </Field>
                    </FieldGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldSet>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              variant="glossy"
              className="w-full"
              type="submit"
              form="form-signin"
              disabled={loading}
            >
              {loading ? <Spinner /> : <Send />} Send Magic Link
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
