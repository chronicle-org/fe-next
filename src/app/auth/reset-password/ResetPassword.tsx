"use client";

import { Button } from "@/components/ui/Button";
import { FancyInput } from "@/components/ui/InputFancy";
import { Spinner } from "@/components/ui/spinner";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { resetPassword } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const ResetPassword = ({ token }: { token: string }) => {
  const { push } = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = !!confirm && password !== confirm;

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => resetPassword(token, password),
    onSuccess: () => {
      toast.success("Password changed. Log in with your new password.");
      push("/auth");
    },
    onError: (error: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.checkValidity() && !mismatch) save();
  };

  return (
    <div className="w-full flex flex-col justify-center max-md:pt-10 items-center px-5">
      <div className="flex flex-col gap-6 w-full max-w-[400px]">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl font-semibold">
            Choose a new password
          </h1>
          <p className="text-sm text-muted-foreground">
            {token
              ? "You'll be logged out everywhere and can log in with the new one."
              : "This link is missing its reset code. Ask for a new link."}
          </p>
        </div>

        {token && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <FancyInput
              id="reset-password"
              label="New password"
              variant="password"
              required
              minLength={6}
              maxLength={255}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FancyInput
              id="reset-password-confirm"
              label="Confirm new password"
              variant="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {mismatch && (
              <p className="text-sm text-destructive" role="alert">
                The passwords don&apos;t match.
              </p>
            )}
            <Button type="submit" disabled={isPending || mismatch}>
              {isPending ? <Spinner /> : "Save new password"}
            </Button>
          </form>
        )}

        <p className="text-sm text-center text-muted-foreground">
          <Link href="/auth/forgot-password" className="text-foreground underline">
            Get a new link
          </Link>
          {" · "}
          <Link href="/auth" className="text-foreground underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
