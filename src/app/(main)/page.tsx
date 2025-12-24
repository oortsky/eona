"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useCountdown } from "@/hooks/use-countdown";
import { useAuth } from "@/contexts/auth-context";
import { useQuota } from "@/hooks/use-quota";
import { getCapsule } from "@/lib/capsule";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Status } from "@/components/status";
import { Countdown } from "@/components/countdown";
import { Quota } from "@/components/quota";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import Link from "next/link";
import { pluralize } from "@/utils/pluralize";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import {
  MailIcon,
  Send,
  CircleX,
  CircleCheck,
  Download,
  Share2,
  Home,
  Unlock,
  Plus,
  Sparkles,
  AlertCircle
} from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  agree: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms of Service and Privacy Policy"
  })
});

export default function Page() {
  const { user, isAuthenticated, sendMagicLink } = useAuth();
  const { isAvailable } = useQuota();
  const router = useRouter();
  const { isOpen } = useCountdown();
  const [loading, setLoading] = React.useState(false);
  const [capsule, setCapsule] = React.useState<any>(null);
  const [checkingCapsule, setCheckingCapsule] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      agree: false
    },
    mode: "onSubmit"
  });

  React.useEffect(() => {
    const checkCapsule = async () => {
      if (!isAuthenticated) {
        setCapsule(null);
        return;
      }

      setCheckingCapsule(true);
      try {
        const result = await getCapsule(user?.$id as string, "user_id");
        if (result.success && result.capsule) {
          setCapsule(result.capsule);
        }
      } catch (error) {
        console.error("Failed to check capsule:", error);
      } finally {
        setCheckingCapsule(false);
      }
    };

    checkCapsule();
  }, [isAuthenticated]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!isOpen) {
      toast.error("Period is closed");
      return;
    }

    if (!isAvailable) {
      toast.error("Quota is reached");
      return;
    }

    setLoading(true);

    try {
      const result = await sendMagicLink(data.email);

      toast.success("Magic link sent! Check your email.");

      form.reset();

      router.push("/verify?status=waiting");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send magic link");
    } finally {
      setLoading(false);
    }
  }

  const renderContent = () => {
    if (!isOpen) {
      return (
        <Card className="mt-12 w-full max-w-2xl rounded-2xl shadow-lg bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia className="rounded-full size-16" variant="icon">
                  <CircleX className="size-8 text-destructive" />
                </EmptyMedia>
                <EmptyTitle className="text-2xl">
                  Sorry, the period is closed
                </EmptyTitle>
                <EmptyDescription className="text-base">
                  The time capsule creation period has ended. Please check back
                  during the next opening period.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      );
    }

    if (!isAvailable) {
      return (
        <Card className="mt-12 w-full max-w-2xl rounded-2xl shadow-lg bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia className="rounded-full size-16" variant="icon">
                  <CircleX className="size-8 text-destructive" />
                </EmptyMedia>
                <EmptyTitle className="text-2xl">
                  Better luck next time
                </EmptyTitle>
                <EmptyDescription className="text-base">
                  Sorry, the quota has been reached. All available time capsule
                  slots have been filled.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      );
    }

    if (isAuthenticated) {
      if (checkingCapsule) {
        return <Skeleton className="mt-12 w-full h-[200px] max-w-2xl" />;
      }

      if (capsule) {
        return (
          <Card className="mt-12 w-full max-w-2xl rounded-2xl shadow-lg bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
            <CardContent className="space-y-4">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia className="rounded-full size-16" variant="icon">
                    <CircleCheck className="size-8 text-green-600 dark:text-green-400" />
                  </EmptyMedia>
                  <EmptyTitle className="text-2xl">
                    Your Time Capsule
                  </EmptyTitle>
                  <EmptyDescription className="text-base">
                    You have already created a time capsule. View your capsule
                    details below.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="w-full rounded-lg bg-background/50 border">
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col items-center gap-3 p-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Capsule Name
                      </p>
                      <p className="text-base font-semibold">
                        {capsule.name || "Unavailable"}
                      </p>
                    </div>

                    <Separator />

                    <div className="flex flex-col items-center gap-3 p-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Owner Email
                      </p>
                      <p className="text-base font-semibold">
                        {capsule.user_email || "Unavailable"}
                      </p>
                    </div>

                    <Separator />

                    <div className="flex flex-col items-center gap-3 p-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Unlock Date
                      </p>
                      <p className="text-base font-semibold">
                        {format(
                          new Date(capsule.locked_until),
                          "EEEE, dd MMMM yyyy",
                          {
                            locale: idLocale
                          }
                        ) || "Unavailable"}
                      </p>
                    </div>
                  </div>
                </EmptyContent>

                <Separator className="my-6" />

                <Alert
                  variant="default"
                  className="border-orange-300 text-orange-300 dark:text-orange-400 dark:border-orange-400"
                >
                  <AlertCircle className="size-4 text-orange-300 dark:text-orange-400" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Remember or note where you placed your capsule and what your
                    secret code. This information is not stored anywhere else.
                  </AlertDescription>
                </Alert>
              </Empty>
            </CardContent>
          </Card>
        );
      }

      return (
        <Card className="mt-12 w-full max-w-2xl rounded-2xl shadow-lg bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia className="rounded-full size-16" variant="icon">
                  <Sparkles className="size-8 text-primary" />
                </EmptyMedia>
                <EmptyTitle className="text-2xl">
                  Create Your Time Capsule
                </EmptyTitle>
                <EmptyDescription className="text-base">
                  You're all set! Click the button below to start creating your
                  time capsule.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="glossy"
                  size="lg"
                  className="rounded-full"
                  onClick={() => router.push("/capsule")}
                >
                  <Plus className="size-4" />
                  Create Capsule
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mt-12 w-full max-w-2xl rounded-2xl shadow-lg bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
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
              {loading ? (
                <>
                  <Spinner /> Sending...
                </>
              ) : (
                <>
                  <Send /> Send Magic Link
                </>
              )}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="mx-auto container flex flex-col justify-center items-center py-12 px-4 w-full min-h-[100dvh]">
      <Status />
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

      <Quota />

      {renderContent()}
    </div>
  );
}
