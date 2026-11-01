"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/spinner";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { verifyEmail } from "@/lib/api/auth";
import { useUserStore } from "@/lib/stores/user.store";
import { setUserCookie } from "@/lib/utils";

const VerifyEmail = ({ token }: { token: string }) => {
  const user = useStore(useUserStore, (s) => s.user);
  const setUser = useStore(useUserStore, (s) => s.setUser);
  const started = useRef(false);

  const { mutate: verify, status, error } = useMutation({
    mutationFn: () => verifyEmail(token),
    onSuccess: () => {
      // Hide the reminder banner for the signed-in user.
      const current = useUserStore.getState().user;
      if (current) {
        const updated = { ...current, email_verified: true };
        setUserCookie(updated);
        setUser(updated);
      }
    },
  });

  useEffect(() => {
    // Strict mode runs effects twice; the link only needs one request.
    if (!token || started.current) return;
    started.current = true;
    verify();
  }, [token, verify]);

  const next = (
    <Button asChild variant="brand">
      <Link href={user ? "/dashboard" : "/auth"}>
        {user ? "Go to your stories" : "Log in"}
      </Link>
    </Button>
  );

  if (!token)
    return (
      <ErrorState
        title="This link is incomplete"
        description="Open the link from your email again, or ask for a new one from the banner after you log in."
        actions={next}
      />
    );
  if (status === "error")
    return (
      <ErrorState
        title="We couldn't confirm your email"
        description={getApiErrorMessage(error as TApiErrorResponse)}
        actions={next}
      />
    );
  if (status === "success")
    return (
      <ErrorState
        title="Your email is confirmed"
        description="Thanks! You're all set."
        actions={next}
      />
    );
  return (
    <div className="flex flex-1 justify-center items-center py-20">
      <Spinner />
    </div>
  );
};

export default VerifyEmail;
