"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCapsule } from "@/lib/capsule";
import type { Capsule, Attachment } from "@/types/capsule";
import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Home,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ZoomIn,
  Share2,
  Download,
  Copy
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ProtectedRoute } from "@/components/protected-route";
import Image from "next/image";

function ViewCapsule() {
  const params = useParams();
  const router = useRouter();
  const capsuleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);

  useEffect(() => {
    const fetchCapsule = async () => {
      if (!capsuleId) {
        toast.error("Capsule ID not found");
        router.push("/unlock");
        return;
      }

      setLoading(true);
      try {
        const result = await getCapsule(capsuleId, "id");

        if (result.success && result.capsule) {
          if (!result.capsule.is_opened) {
            toast.error("This capsule hasn't been unlocked yet");
            router.push("/unlock");
            return;
          }

          setCapsule(result.capsule);

          if (result.capsule.attachment) {
            try {
              const parsedAttachment = JSON.parse(result.capsule.attachment);
              setAttachment(parsedAttachment);
            } catch (error) {
              console.error("Failed to parse attachment:", error);
            }
          }
        } else {
          toast.error("Capsule not found");
          router.push("/unlock");
        }
      } catch (error) {
        console.error("Failed to fetch capsule:", error);
        toast.error("Failed to load capsule");
        router.push("/unlock");
      } finally {
        setLoading(false);
      }
    };

    fetchCapsule();
  }, [capsuleId, router]);

  if (loading) {
    return <Loading />;
  }

  if (!capsule) {
    return null;
  }

  const openedDate = format(new Date(capsule.$updatedAt), "dd MMMM yyyy", {
    locale: idLocale
  });

  const getMediaType = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return null;
  };

  const mediaType = attachment ? getMediaType(attachment.type) : null;

  return (
    <div className="container mx-auto py-12 px-4 min-h-[100dvh]">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-logo tracking-widest drop-shadow-lg -mb-1 -mr-2">
            {capsule.name}
          </h1>
          <p className="text-sm font-mono text-muted-foreground">
            Opened on {openedDate}
          </p>
        </div>

        {/* Media Display */}
        {attachment && mediaType === "image" && (
          <ImageViewer src={attachment.url} alt={attachment.name} />
        )}

        {attachment && mediaType === "video" && (
          <VideoPlayer src={attachment.url} />
        )}

        {attachment && mediaType === "audio" && (
          <AudioPlayer src={attachment.url} filename={attachment.name} />
        )}

        {/* Message Card with ScrollArea */}
        <Card className="w-full max-w-2xl rounded-2xl shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
          <CardHeader>
            <p className="text-sm text-muted-foreground">
              A message for you from the past:
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {capsule.message}
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Written by yourself in the past. ❤️
            </p>
          </CardFooter>
        </Card>

        {/* Action */}
        <div className="flex justify-center gap-4">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="glossy">
                <Share2 className="size-4" /> Share Capsule
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Share this page</DrawerTitle>
                <DrawerDescription>
                  Choose how you want to share this content
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <Button
                  variant="glossy-outline"
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard.");
                  }}
                >
                  <Copy className="size-4" /> Copy Link
                </Button>
                <Button
                  variant="glossy-outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: document.title,
                        url: window.location.href
                      });
                    }
                  }}
                >
                  <Share2 className="size-4" /> Share via...
                </Button>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="glossy">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Button variant="glossy-outline" asChild>
            <Link href="/">
              <Home className="size-4" /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ImageViewer({ src, alt }: { src: string; alt: string }) {
  return (
    <Card className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
      <CardContent className="p-0">
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer">
              <AspectRatio ratio={3 / 4} className="bg-muted">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </AspectRatio>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm rounded-full p-4">
                  <ZoomIn className="size-8" />
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="w-full h-[100dvh] bg-transparent backdrop-blur-xl p-0">
            <DialogHeader>
              <DialogTitle className="sr-only">{alt}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full">
              <AspectRatio ratio={3 / 4}>
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-contain"
                  sizes="95vw"
                />
              </AspectRatio>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function VideoPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (!videoRef) return;
    if (isPlaying) {
      videoRef.pause();
    } else {
      videoRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!videoRef) return;
    if (videoRef.requestFullscreen) {
      videoRef.requestFullscreen();
    }
  };

  useEffect(() => {
    if (!videoRef) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoRef.addEventListener("play", handlePlay);
    videoRef.addEventListener("pause", handlePause);

    return () => {
      videoRef.removeEventListener("play", handlePlay);
      videoRef.removeEventListener("pause", handlePause);
    };
  }, [videoRef]);

  return (
    <Card className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
      <CardContent className="p-0 relative group">
        <AspectRatio ratio={16 / 9} className="bg-black">
          <video
            ref={setVideoRef}
            src={src}
            className="w-full h-full object-contain"
            controls
            playsInline
          />
        </AspectRatio>

        {/* Custom overlay controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="size-5" />
                ) : (
                  <Play className="size-5" />
                )}
              </Button>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="size-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AudioPlayer({ src, filename }: { src: string; filename: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef) return;

    const updateTime = () => setCurrentTime(audioRef.currentTime);
    const updateDuration = () => setDuration(audioRef.duration);
    const handleEnded = () => setIsPlaying(false);

    audioRef.addEventListener("timeupdate", updateTime);
    audioRef.addEventListener("loadedmetadata", updateDuration);
    audioRef.addEventListener("ended", handleEnded);

    return () => {
      audioRef.removeEventListener("timeupdate", updateTime);
      audioRef.removeEventListener("loadedmetadata", updateDuration);
      audioRef.removeEventListener("ended", handleEnded);
    };
  }, [audioRef]);

  const togglePlay = () => {
    if (!audioRef) return;
    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef) return;
    audioRef.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef) return;
    const time = parseFloat(e.target.value);
    audioRef.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_8px_24px_hsl(var(--primary)/0.4),0_4px_8px_hsl(var(--primary)/0.2),inset_0_1px_0_rgba(255,255,255,0.3)]">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Volume2 className="size-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{filename}</p>
              <p className="text-xs text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%, hsl(var(--muted)) 100%)`
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </Button>

            <Button
              variant="default"
              size="icon"
              className="rounded-full w-14 h-14 shadow-lg"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="size-6" />
              ) : (
                <Play className="size-6" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              asChild
            >
              <a href={src} download target="_blank" rel="noopener noreferrer">
                <Download className="size-4" />
              </a>
            </Button>
          </div>

          {/* Hidden Audio Element */}
          <audio ref={setAudioRef} src={src} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  return (
    <ProtectedRoute requireHasCapsule={true}>
      <ViewCapsule />
    </ProtectedRoute>
  );
}
