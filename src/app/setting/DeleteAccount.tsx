"use client";

import { Button } from "@/components/ui/Button";
import { FancyInput } from "@/components/ui/InputFancy";
import { Modal } from "@/components/ui/Modal";
import { getApiErrorMessage, TApiErrorResponse } from "@/lib/api";
import { deleteAccount } from "@/lib/api/auth";
import { useUserStore } from "@/lib/stores/user.store";
import { deleteCookie } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useStore } from "zustand";

export const DeleteAccount = () => {
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const setUser = useStore(useUserStore, (s) => s.setUser);
  const { push } = useRouter();

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => deleteAccount(password),
    onSuccess: () => {
      deleteCookie();
      setUser(null);
      push("/auth");
      toast.success("Your account was deleted");
    },
    onError: (err: TApiErrorResponse) => {
      setConfirming(false);
      toast.error(getApiErrorMessage(err, "Could not delete your account"));
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (e.currentTarget.checkValidity()) setConfirming(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 w-full max-w-[400px]"
    >
      <p className="text-sm text-muted-foreground">
        This permanently deletes your profile, posts, drafts and comments, and
        removes your likes, bookmarks and follows. It can&apos;t be undone.
      </p>
      <FancyInput
        id="delete-account-password"
        label="Password"
        variant="password"
        required
        autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" variant="destructive" className="w-fit">
        Delete account
      </Button>
      <Modal
        isOpen={confirming}
        onClose={() => !isPending && setConfirming(false)}
        title="Delete your account?"
        variant="destructive"
        confirmText="Delete forever"
        isLoading={isPending}
        onConfirm={() => submit()}
      >
        Everything you&apos;ve posted on Chronicle will be gone. This can&apos;t
        be undone.
      </Modal>
    </form>
  );
};
