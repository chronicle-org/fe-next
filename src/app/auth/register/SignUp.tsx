"use client";

import { Button } from "@/components/ui/Button";
import { FancyInput } from "@/components/ui/InputFancy";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage, TApiErrorResponse } from "@/lib/api";
import { logUserIn, registerUser, TRegisterPayload } from "@/lib/api/auth";
import { useUserStore } from "@/lib/stores/user.store";
import { cn, setCookie } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useStore } from "zustand";

// Same limits the API enforces in RegisterDto.
const NAME_MIN = 2;
const EMAIL_MAX = 50;
const PASSWORD_MIN = 6;

const initForm: TRegisterPayload & { confirmPassword: string } = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const SignUp = () => {
  const { push } = useRouter();
  const [form, setForm] = useState(initForm);
  const refreshUser = useStore(useUserStore, (s) => s.refreshUser);

  const { mutate: signUp, isPending } = useMutation({
    mutationFn: async () => {
      const { name, email, password } = form;
      await registerUser({ name: name.trim(), email, password });
      // Log straight in so a new user lands on the dashboard.
      return logUserIn({ email, password });
    },
    onSuccess: async (res) => {
      toast.success("Welcome to Chronicle!");
      await setCookie(JSON.stringify(res.data.content));
      refreshUser();
      push("/dashboard");
    },
    onError: (err: TApiErrorResponse) =>
      toast.error(getApiErrorMessage(err, "Could not create your account")),
  });

  const passwordsMatch =
    !form.confirmPassword || form.password === form.confirmPassword;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }
    if (e.currentTarget.checkValidity()) signUp();
  };

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div
      className={cn(
        "w-full flex flex-col justify-center max-md:justify-normal max-md:pt-10 items-center gap-10"
      )}
    >
      <div className="relative w-[30vw] max-md:w-[30vh] h-[30vw] max-md:h-[30vh] rounded-lg overflow-hidden md:hidden">
        <Image src={"/auth-side-image.png"} alt="auth-side-image" fill />
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-10 w-full max-w-[400px]"
      >
        <div className="flex flex-col gap-5">
          <FancyInput
            id="signup-name"
            label="Name"
            required
            minLength={NAME_MIN}
            maxLength={255}
            autoComplete="name"
            onChange={update("name")}
          />
          <FancyInput
            id="signup-email"
            label="Email"
            type="email"
            required
            maxLength={EMAIL_MAX}
            autoComplete="email"
            onChange={update("email")}
          />
          <FancyInput
            id="signup-password"
            label="Password"
            variant="password"
            required
            minLength={PASSWORD_MIN}
            maxLength={255}
            autoComplete="new-password"
            onChange={update("password")}
          />
          <FancyInput
            id="signup-confirm-password"
            label="Confirm password"
            variant="password"
            required
            autoComplete="new-password"
            error={!passwordsMatch}
            onChange={update("confirmPassword")}
          />
          {!passwordsMatch && (
            <p className="text-xs text-destructive -mt-3">
              Passwords do not match
            </p>
          )}
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner /> : "Sign up"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth" className="text-foreground underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
