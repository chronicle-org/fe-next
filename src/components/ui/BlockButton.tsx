"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { TLoginResponse } from "@/lib/api/auth";
import {
  blockUser,
  getBlockedUsers,
  getUserProfile,
  unblockUser,
} from "@/lib/api/user";
import { useUserStore } from "@/lib/stores/user.store";
import { Modal } from "./Modal";

export const BLOCKED_USERS_KEY = ["users", "blocked"];

/** The ids of the first people the viewer blocked; enough for profile buttons. */
export const useBlockedIds = (enabled: boolean) =>
  useQuery({
    queryKey: BLOCKED_USERS_KEY,
    enabled,
    queryFn: async () => {
      try {
        const res = await getBlockedUsers({ page: 1, limit: 50 });
        return new Set((res.data.content?.data ?? []).map((u) => u.id));
      } catch {
        // An API without blocking: nobody is blocked.
        return new Set<number>();
      }
    },
  });

/** Block or unblock someone, asking first before blocking. */
export const BlockButton = ({
  target,
}: {
  target: Pick<TLoginResponse, "id" | "name">;
}) => {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const { data: blocked } = useBlockedIds(!!user);
  const isBlocked = !!blocked?.has(target.id);

  const { mutate: toggle, isPending } = useMutation({
    mutationFn: () =>
      isBlocked ? unblockUser(target.id) : blockUser(target.id),
    onSuccess: async () => {
      toast.success(isBlocked ? "Unblocked" : `Blocked ${target.name}`);
      setConfirming(false);
      await queryClient.invalidateQueries({ queryKey: BLOCKED_USERS_KEY });
      // Blocking ends any follow between you, so refresh your counts.
      if (user) {
        const res = await getUserProfile(user.id);
        if (res.data.content) setUser({ ...user, ...res.data.content });
      }
    },
    onError: (error: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  if (!user || user.id === target.id) return null;

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        className="text-xs text-muted-foreground hover:text-destructive cursor-pointer w-fit"
        onClick={() => (isBlocked ? toggle() : setConfirming(true))}
      >
        {isBlocked ? "Unblock" : "Block"}
      </button>
      <Modal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        title={`Block ${target.name}?`}
        onConfirm={() => toggle()}
        confirmText="Block"
        isLoading={isPending}
        variant="destructive"
      >
        <p className="text-sm text-muted-foreground">
          You&apos;ll stop following each other. They won&apos;t be able to
          follow you, comment on your stories or reply to you, and you
          won&apos;t see their comments or get notifications from them. They
          aren&apos;t told.
        </p>
      </Modal>
    </>
  );
};
