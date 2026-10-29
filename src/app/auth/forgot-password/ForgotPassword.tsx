"use client";

import { Button } from "@/components/ui/Button";
import { FancyInput } from "@/components/ui/InputFancy";
import { Spinner } from "@/components/ui/spinner";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { requestPasswordReset } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const { mutate: send, isPending } = useMutation({
    mutationFn: () => requestPasswordReset(email),
    onSuccess: () => setSent(true),
    onError: (error: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.checkValidity()) send();
  };

  return (
    <div className="w-full flex flex-col justify-center max-md:pt-10 items-center px-5">
      <div className="flex flex-col gap-6 w-full max-w-[400px]">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl font-semibold">
            Forgot your password?
          </h1>
          <p className="text-sm text-muted-foreground">
            {sent
              ? "If that email has an account, we've sent it a link to choose a new password. The link works for 30 minutes."
              : "Enter your account's email and we'll send you a link to choose a new one."}
          </p>
        </div>

        {sent ? (
          <Button variant="secondary" onClick={() => setSent(false)}>
            Send to a different email
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <FancyInput
              id="forgot-email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="text-sm text-center text-muted-foreground">
          Remembered it?{" "}
          <Link href="/auth" className="text-foreground underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
