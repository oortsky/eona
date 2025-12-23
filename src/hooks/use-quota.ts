import React from "react";
import { getTotalCapsules } from "@/lib/capsule";

export function useQuota() {
  const [available, setAvailable] = React.useState<number | null>(null);
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchQuota = async () => {
      try {
        setLoading(true);

        const result = await getTotalCapsules();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch quota");
        }

        const limit = parseInt(
          process.env.NEXT_PUBLIC_CAPSULES_LIMIT || "1000"
        );
        const used = result.total;
        const remaining = Math.max(0, limit - used);

        setAvailable(remaining);
        setIsAvailable(remaining > 0);
      } catch (err: any) {
        console.error("Failed to fetch quota:", err);
        setAvailable(0);
        setIsAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    fetchQuota();
  }, []);

  return { available, isAvailable, loading };
}
