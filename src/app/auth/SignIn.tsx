"use client";

import { Button } from "@/components/ui/Button";
import { FancyInput } from "@/components/ui/InputFancy";
import { Spinner } from "@/components/ui/spinner";
import { logUserIn, TLoginPayload } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { TApiErrorResponse } from "@/lib/api";
import { cn, setCookie } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/user.store";
import { useStore } from "zustand";

const initForm: TLoginPayload = {
  email: "",
  password: "",
};

const SignIn = () => {
  const { push } = useRouter();
  const [form, setForm] = useState<TLoginPayload>(initForm);
  const refreshUser = useStore(useUserStore, (s) => s.refreshUser);

  const { mutate: logIn, isPending: isLoggingIn } = useMutation({
    mutationFn: () => logUserIn(form),
    onSuccess: async (res) => {
      toast.success("Successfully logged in");
      const parsedCookie = JSON.stringify(res.data.content);
      await setCookie(parsedCookie);
      refreshUser();
      push("/dashboard");
    },
    onError: (res: TApiErrorResponse) => {
      toast.error(res.response?.data.message);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.checkValidity()) logIn();
  };

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
            label="Email"
            type="email"
            required
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <FancyInput
            label="Password"
            variant="password"
            required
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
          />
        </div>

        <Button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? <Spinner /> : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default SignIn;
