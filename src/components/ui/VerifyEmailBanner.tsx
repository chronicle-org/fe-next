"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "zustand";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { resendVerification } from "@/lib/api/auth";
import { useUserStore } from "@/lib/stores/user.store";

const DISMISSED_KEY = "chronicle-verify-banner-dismissed";

/** Reminds a signed-in user to confirm their email, with a resend button. */
export const VerifyEmailBanner = () => {
  const user = useStore(useUserStore, (s) => s.user);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const { mutate: resend, isPending } = useMutation({
    mutationFn: resendVerification,
    onSuccess: () => toast.success("Sent. Check your inbox."),
    onError: (error: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  // Older API responses have no email_verified; only an explicit false counts.
  if (!user || user.email_verified !== false || dismissed) return null;

  return (
    <div
      role="status"
      className="w-full bg-brand-soft text-foreground text-sm px-5 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
    >
      <span>
        Confirm your email: we sent a link to{" "}
        <strong className="font-medium">{user.email}</strong>.
      </span>
      <button
        type="button"
        disabled={isPending}
        className="underline cursor-pointer disabled:opacity-50"
        onClick={() => resend()}
      >
        Send it again
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        className="text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem(DISMISSED_KEY, "1");
          } catch {}
        }}
      >
        ✕
      </button>
    </div>
  );
};
