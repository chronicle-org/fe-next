"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { LoadMore } from "@/components/ui/LoadMore";
import { Spinner } from "@/components/ui/spinner";
import { BLOCKED_USERS_KEY } from "@/components/ui/BlockButton";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { getBlockedUsers, unblockUser } from "@/lib/api/user";
import { useLoadMoreQuery } from "@/lib/hooks/useLoadMoreQuery";

export const BlockedPeople = () => {
  const queryClient = useQueryClient();
  const {
    items,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useLoadMoreQuery({
    queryKey: [...BLOCKED_USERS_KEY, "settings"],
    fetchPage: getBlockedUsers,
  });

  const { mutate: unblock, isPending, variables } = useMutation({
    mutationFn: (id: number) => unblockUser(id),
    onSuccess: () => {
      toast.success("Unblocked");
      refetch();
      queryClient.invalidateQueries({ queryKey: BLOCKED_USERS_KEY });
    },
    onError: (error: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <p className="text-sm text-muted-foreground">
        People you block can&apos;t follow you, comment on your stories or
        reply to you, and you won&apos;t see their comments or get
        notifications from them.
      </p>
      {isLoading ? (
        <Spinner />
      ) : !items.length ? (
        <p className="text-sm">You haven&apos;t blocked anyone.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {items.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between gap-3 py-2"
            >
              <Link
                href={`/profile/${person.id}`}
                className="flex flex-col min-w-0 hover:underline"
              >
                <span className="font-medium truncate">{person.name}</span>
                <span className="text-xs text-muted-foreground">
                  @{person.handle}
                </span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending && variables === person.id}
                onClick={() => unblock(person.id)}
              >
                Unblock
              </Button>
            </li>
          ))}
        </ul>
      )}
      <LoadMore
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        onClick={() => fetchNextPage()}
      />
    </div>
  );
};
