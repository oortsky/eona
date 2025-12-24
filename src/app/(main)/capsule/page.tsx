"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { addYears, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import * as z from "zod";
import { Upload, X, Save, Sprout, AlertCircle } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { useAuth } from "@/contexts/auth-context";
import { createCapsule } from "@/lib/capsule";
import { uploadAttachment } from "@/lib/storage";
import { getCurrentLocation } from "@/utils/geolocation";
import type { Footprint } from "@/types/capsule";

import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  InputGroupText
} from "@/components/ui/input-group";
import { Slider } from "@/components/ui/slider";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(25, "Name must be at most 25 characters"),
  message: z
    .string()
    .min(100, "Message must be at least 100 characters")
    .max(600, "Message must be at most 600 characters"),
  attachment: z
    .instanceof(File)
    .refine(file => file.size <= 50 * 1024 * 1024, {
      message: "File must be less than 50MB"
    })
    .refine(
      file => {
        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
          "video/mp4",
          "video/webm",
          "video/quicktime",
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/ogg"
        ];
        return validTypes.includes(file.type);
      },
      {
        message: "File must be an image, video, or audio file"
      }
    )
    .optional(),
  years_locked: z
    .number()
    .min(1, "Must be locked for at least 1 year")
    .max(3, "Cannot be locked for more than 3 years")
    .int("Must be a whole number"),
  code: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must contain only numbers")
});

const STORAGE_KEY = "time-capsule-draft";

function CreateCapsule() {
  const router = useRouter();
  const { user } = useAuth();

  const [preview, setPreview] = React.useState<string | null>(null);
  const [fileType, setFileType] = React.useState<
    "image" | "video" | "audio" | null
  >(null);
  const [fileName, setFileName] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      message: "",
      years_locked: 1,
      code: ""
    }
  });

  const yearsLocked = form.watch("years_locked");
  const messageValue = form.watch("message");
  const nameValue = form.watch("name");
  const unlockDate = addYears(new Date(), yearsLocked);

  React.useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        form.setValue("name", draft.name || "");
        form.setValue("message", draft.message || "");
        form.setValue("years_locked", draft.years_locked || 1);
        form.setValue("code", draft.code || "");

        if (draft.fileName) {
          setFileName(draft.fileName);
          setFileType(draft.fileType);
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, [form]);

  React.useEffect(() => {
    const subscription = form.watch(values => {
      const draft = {
        name: values.name,
        message: values.message,
        years_locked: values.years_locked,
        code: values.code,
        fileName: fileName,
        fileType: fileType,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    });

    return () => subscription.unsubscribe();
  }, [form, fileName, fileType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      setFileType("image");
      setPreview(URL.createObjectURL(file));
    } else if (file.type.startsWith("video/")) {
      setFileType("video");
      setPreview(URL.createObjectURL(file));
    } else if (file.type.startsWith("audio/")) {
      setFileType("audio");
      setPreview(URL.createObjectURL(file));
    }

    form.setValue("attachment", file);
  };

  const removeFile = () => {
    setPreview(null);
    setFileType(null);
    setFileName("");
    form.setValue("attachment", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    removeFile();
  };

  const charactersLeft = 600 - messageValue.length;

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      if (!user?.$id || !user?.email) {
        toast.error("Authentication Error", {
          description: "Please login first!"
        });
        return;
      }

      setLoading(true);

      const locked_until = addYears(
        new Date(),
        data.years_locked
      ).toISOString();

      let footprint: Footprint | null = null;
      try {
        footprint = await getCurrentLocation({
          timeout: 10000,
          maximumAge: 60000
        });
        console.log("Location captured:", footprint);
      } catch (error) {
        console.warn("Failed to get location:", error);
      }

      let attachmentData;
      if (data.attachment) {
        const uploadResult = await uploadAttachment(data.attachment);

        if (!uploadResult.success) {
          toast.error("Upload Failed", {
            description: uploadResult.error || "Failed to upload file"
          });
          setLoading(false);
          return;
        }

        attachmentData = {
          fileId: uploadResult.fileId!,
          name: data.attachment.name,
          size: data.attachment.size,
          type: data.attachment.type,
          lastModified: data.attachment.lastModified,
          url: uploadResult.url!
        };
      }

      const result = await createCapsule({
        userId: user.$id,
        userEmail: user.email,
        name: data.name,
        message: data.message,
        code: data.code,
        lockedUntil: locked_until,
        footprint,
        attachmentData
      });

      if (result.success) {
        localStorage.removeItem(STORAGE_KEY);

        form.reset();
        removeFile();

        const locationStatus = footprint
          ? "with location lock"
          : "without location lock";

        toast.success("Success!", {
          description: `Time Capsule created ${locationStatus}`
        });

        router.push(`/result?status=success&id=${result?.capsule?.$id}`);
      } else {
        toast.error("Creation Failed", {
          description: result.error || "Failed to create capsule"
        });
      }
    } catch (error) {
      console.error("Create capsule error:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  }

  const saveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Draft saved!", {
        description: "Your progress has been saved locally"
      });
    }, 500);
  };

  return (
    <div className="container mx-auto py-12 px-4 w-full min-h-[100dvh]">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-logo tracking-widest drop-shadow-lg -mb-1 -mr-2 mb-4">
          EONA
        </h1>
        <p className="text-base font-mono font-bold tracking-wider">
          Create Your Time Capsule
        </p>
      </div>

      <Card className="w-full max-w-2xl mx-auto rounded-2xl bg-gradient-to-b from-background/90 via-background to-background/80 shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create Capsule</CardTitle>
              <CardDescription>
                Seal your message and memories to be opened in the future
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={saveDraft}
              disabled={loading || isSaving}
              className="p-2 rounded-full text-muted-foreground"
            >
              {isSaving ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form id="time-capsule-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* Name Field */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="capsule-name">Capsule Name</FieldLabel>
                    <Input
                      {...field}
                      id="capsule-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Write a name for your capsule..."
                      className="rounded-2xl dark:bg-input/30"
                      maxLength={25}
                      disabled={loading || isSaving}
                    />
                    <FieldDescription>
                      Give your capsule a memorable name - so that you can
                      remember.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Message Field with InputGroup */}
              <Controller
                name="message"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="capsule-message">
                      Your Message
                    </FieldLabel>
                    <InputGroup className="rounded-2xl">
                      <TextareaAutosize
                        {...field}
                        data-slot="input-group-control"
                        id="capsule-message"
                        aria-invalid={fieldState.invalid}
                        placeholder="Write a message to your future self..."
                        className="flex field-sizing-content min-h-[200px] w-full resize-none rounded-2xl bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
                        minRows={4}
                        minLength={100}
                        maxLength={600}
                        disabled={loading || isSaving}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="text-muted-foreground text-xs tabular-nums">
                          {messageValue.length < 600
                            ? `${charactersLeft} characters left`
                            : "No characters left"}
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Pour your heart out - this message is for future you.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Attachment Field with Empty Component */}
              <Controller
                name="attachment"
                control={form.control}
                render={({ fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Attachment (Optional)</FieldLabel>

                    {!preview ? (
                      <Empty
                        className="border border-dashed rounded-2xl cursor-pointer dark:bg-input/30 hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Upload />
                          </EmptyMedia>
                          <EmptyTitle>Upload Memory</EmptyTitle>
                          <EmptyDescription>
                            Attach a photo, video, or audio to preserve the
                            moment
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button
                            variant="glossy-outline"
                            size="sm"
                            type="button"
                            className="rounded-full"
                          >
                            Choose File
                          </Button>
                        </EmptyContent>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*,audio/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={loading || isSaving}
                        />
                      </Empty>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative border rounded-2xl overflow-hidden">
                          {fileType === "image" && (
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-64 object-cover"
                            />
                          )}
                          {fileType === "video" && (
                            <video
                              src={preview}
                              controls
                              className="w-full h-64"
                            />
                          )}
                          {fileType === "audio" && (
                            <div className="p-8 bg-muted flex flex-col items-center justify-center">
                              <audio
                                src={preview}
                                controls
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground truncate">
                            {fileName}
                          </p>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={removeFile}
                            className="rounded-full text-muted-foreground"
                            disabled={loading || isSaving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <FieldDescription>
                      Maximum file size: 50MB. Supports images, videos, and
                      audio files.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Years Locked Slider */}
              <Controller
                name="years_locked"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="capsule-years">
                      Lock Duration: {yearsLocked}{" "}
                      {yearsLocked === 1 ? "Year" : "Years"}
                    </FieldLabel>
                    <Slider
                      id="capsule-years"
                      min={1}
                      max={3}
                      step={1}
                      value={[field.value]}
                      onValueChange={value => field.onChange(value[0])}
                      className="py-4"
                      disabled={loading || isSaving}
                    />
                    <FieldDescription>
                      Will unlock on:{" "}
                      <strong>
                        {format(new Date(unlockDate), "EEEE, dd MMMM yyyy", {
                          locale: idLocale
                        })}
                      </strong>
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Security Code with InputOTP */}
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="capsule-code">
                      Security Code
                    </FieldLabel>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loading || isSaving}
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
                      Create a 6-digit code to protect your capsule. Don't
                      forget it!
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <Separator className="my-6" />

          <Alert
            variant="default"
            className="border-orange-300 text-orange-300 dark:text-orange-400 dark:border-orange-400"
          >
            <AlertCircle className="size-3 text-orange-300 dark:text-orange-400" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Remember or note where you placed your capsule and what your
              secret code. This information is not stored anywhere else.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="glossy-outline"
            onClick={reset}
            className="rounded-full"
            disabled={loading || isSaving}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="time-capsule-form"
            className="rounded-full"
            variant="glossy"
            disabled={loading || isSaving}
          >
            {loading ? (
              <>
                <Spinner /> Planting..
              </>
            ) : (
              <>
                <Sprout /> Plant Capsule
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute requireNoCapsule={true}>
      <CreateCapsule />
    </ProtectedRoute>
  );
}
