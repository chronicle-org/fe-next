"use client";

import { Button } from "@/components/ui/Button";
import { FancyInput } from "@/components/ui/InputFancy";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage, TApiErrorResponse } from "@/lib/api";
import { changePassword } from "@/lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

// Same minimum the API enforces in ChangePasswordDto.
const PASSWORD_MIN = 6;

const initForm = { current: "", next: "", confirm: "" };

export const ChangePassword = () => {
  const [form, setForm] = useState(initForm);
  // FancyInput keeps its own value, so remount the fields to clear them.
  const [formKey, setFormKey] = useState(0);

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      changePassword({
        current_password: form.current,
        new_password: form.next,
      }),
    onSuccess: () => {
      toast.success("Password changed");
      setForm(initForm);
      setFormKey((key) => key + 1);
    },
    onError: (err: TApiErrorResponse) =>
      toast.error(getApiErrorMessage(err, "Could not change your password")),
  });

  const passwordsMatch = !form.confirm || form.next === form.confirm;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }
    if (e.currentTarget.checkValidity()) submit();
  };

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <form
      key={formKey}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 w-full max-w-[400px]"
    >
      <FancyInput
        id="current-password"
        label="Current password"
        variant="password"
        required
        autoComplete="current-password"
        onChange={update("current")}
      />
      <FancyInput
        id="new-password"
        label="New password"
        variant="password"
        required
        minLength={PASSWORD_MIN}
        maxLength={255}
        autoComplete="new-password"
        onChange={update("next")}
      />
      <FancyInput
        id="confirm-new-password"
        label="Confirm new password"
        variant="password"
        required
        autoComplete="new-password"
        error={!passwordsMatch}
        onChange={update("confirm")}
      />
      {!passwordsMatch && (
        <p className="text-xs text-destructive -mt-3">Passwords do not match</p>
      )}
      <Button type="submit" className="w-fit" disabled={isPending}>
        {isPending ? <Spinner /> : "Change password"}
      </Button>
    </form>
  );
};
