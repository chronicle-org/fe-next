"use client";

import { CommentIcon, DeleteIcon } from "@/components/Icons";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { getAllByPostId, postComment } from "@/lib/api/comment";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useLoadMoreQuery } from "@/lib/hooks/useLoadMoreQuery";
import { LoadMore } from "./LoadMore";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export const CommentSection = ({
  postId,
  userId,
  postOwnerId,
  onDelete,
}: {
  postId?: number;
  userId?: number;
  postOwnerId?: number;
  onDelete?: (id: number, cb: () => void) => void;
}) => {
  const [comment, setComment] = useState("");

  const {
    items: comments,
    total,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch: refetchComments,
  } = useLoadMoreQuery({
    enabled: !!postId,
    queryKey: [`post-${postId}-comments`],
    fetchPage: (params) => getAllByPostId(postId as number, params),
  });

  const { mutate: post, isPending: isPosting } = useMutation({
    mutationFn: () =>
      postComment({ post_id: postId!, content: comment }),
    onSuccess: async () => {
      toast.success("Comment posted");
      setComment("");
      refetchComments();
    },
    onError: (error: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-[800px] mx-auto">
      <div className="text-end">{total} Comments</div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          placeholder="Write your comment here..."
          value={comment}
          disabled={isPosting}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button
          variant={"secondary"}
          className="w-fit self-end"
          disabled={!comment.length || isPosting}
          onClick={() => post()}
          type="button"
        >
          Submit
          {isPosting && <Spinner />}
        </Button>
      </form>
      {!comments.length ? (
        <div className="w-full flex flex-col gap-5 text-muted-foreground items-center">
          <p>No comment found</p>
          <CommentIcon width={100} height={100} />
        </div>
      ) : (
        comments.map((comment) => {
          return (
            <div
              key={comment.id}
              className={cn(
                "w-full max-h-[100px] truncate",
                "p-2.5 text-sm flex gap-10 relative"
              )}
            >
              <div className="flex flex-col gap-2.5 border-r border-muted px-5 max-w-[200px]">
                <div className="flex gap-2.5 items-center">
                  {!comment.user.picture_url ? (
                    <UserIcon />
                  ) : (
                    <div className="relative h-[30px] aspect-square rounded-full overflow-hidden">
                      <Image
                        src={comment.user.picture_url}
                        alt={comment.user.name}
                        fill
                      />
                    </div>
                  )}
                  <span>{comment.user.name}</span>
                </div>
                <span className="w-full text-xs text-muted-foreground">
                  @{comment.user.handle}
                </span>
              </div>
              <p>{comment.content}</p>
              {(userId === comment.user.id || userId === postOwnerId) &&
                onDelete && (
                  <Button
                    className="absolute top-2 right-2 p-1! h-fit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(comment.id, () => refetchComments());
                    }}
                    variant={"destructive"}
                  >
                    <DeleteIcon color="white" />
                  </Button>
                )}
            </div>
          );
        })
      )}
      <LoadMore
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        onClick={() => fetchNextPage()}
      />
    </div>
  );
};
