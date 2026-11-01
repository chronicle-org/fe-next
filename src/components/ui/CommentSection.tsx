"use client";

import { CommentIcon } from "@/components/Icons";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { getAllByPostId, postComment, TComment } from "@/lib/api/comment";
import { useMutation } from "@tanstack/react-query";
import { useLoadMoreQuery } from "@/lib/hooks/useLoadMoreQuery";
import { LoadMore } from "./LoadMore";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

dayjs.extend(relativeTime);

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
  // The top-level comment whose reply box is open.
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

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
        <ul className="flex flex-col gap-6">
          {comments.map((comment) => (
            <li key={comment.id} className="flex flex-col gap-3">
              <CommentItem
                comment={comment}
                canDelete={
                  userId === comment.user.id || userId === postOwnerId
                }
                onDelete={
                  onDelete &&
                  (() => onDelete(comment.id, () => refetchComments()))
                }
                onReply={() => setReplyingTo(comment.id)}
              />
              {(!!comment.replies?.length || replyingTo === comment.id) && (
                <ul className="flex flex-col gap-3 ml-5 sm:ml-10 pl-4 border-l-2 border-border">
                  {comment.replies?.map((reply) => (
                    <li key={reply.id}>
                      <CommentItem
                        comment={reply}
                        canDelete={
                          userId === reply.user.id || userId === postOwnerId
                        }
                        onDelete={
                          onDelete &&
                          (() => onDelete(reply.id, () => refetchComments()))
                        }
                        onReply={() => setReplyingTo(comment.id)}
                      />
                    </li>
                  ))}
                  {replyingTo === comment.id && postId && (
                    <li>
                      <ReplyForm
                        postId={postId}
                        parentId={comment.id}
                        replyingToName={comment.user.name}
                        onCancel={() => setReplyingTo(null)}
                        onPosted={() => {
                          setReplyingTo(null);
                          refetchComments();
                        }}
                      />
                    </li>
                  )}
                </ul>
              )}
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

const CommentItem = ({
  comment,
  canDelete,
  onDelete,
  onReply,
}: {
  comment: TComment;
  canDelete: boolean;
  onDelete?: () => void;
  onReply: () => void;
}) => (
  <div className="flex gap-3 text-sm">
    {!comment.user.picture_url ? (
      <UserIcon className="shrink-0 size-8 p-1 rounded-full bg-muted" />
    ) : (
      <div className="relative size-8 shrink-0 rounded-full overflow-hidden">
        <Image src={comment.user.picture_url} alt={comment.user.name} fill />
      </div>
    )}
    <div className="flex flex-col gap-1 min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <Link
          href={`/profile/${comment.user.id}`}
          className="font-medium hover:underline"
        >
          {comment.user.name}
        </Link>
        <span className="text-xs text-muted-foreground">
          @{comment.user.handle} · {dayjs(comment.created_at).fromNow()}
        </span>
      </div>
      <p className="whitespace-pre-wrap break-words">{comment.content}</p>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <button
          type="button"
          className="hover:text-foreground cursor-pointer"
          onClick={onReply}
        >
          Reply
        </button>
        {canDelete && onDelete && (
          <button
            type="button"
            className="hover:text-destructive cursor-pointer"
            onClick={onDelete}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  </div>
);

const ReplyForm = ({
  postId,
  parentId,
  replyingToName,
  onCancel,
  onPosted,
}: {
  postId: number;
  parentId: number;
  replyingToName: string;
  onCancel: () => void;
  onPosted: () => void;
}) => {
  const [content, setContent] = useState("");
  const { mutate: post, isPending } = useMutation({
    mutationFn: () =>
      postComment({ post_id: postId, content, parent_id: parentId }),
    onSuccess: () => {
      toast.success("Reply posted");
      onPosted();
    },
    onError: (error: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (content.trim()) post();
      }}
    >
      <Textarea
        autoFocus
        aria-label={`Reply to ${replyingToName}`}
        placeholder={`Reply to ${replyingToName}...`}
        value={content}
        disabled={isPending}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex gap-2 self-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="secondary"
          disabled={!content.trim() || isPending}
        >
          Reply
          {isPending && <Spinner />}
        </Button>
      </div>
    </form>
  );
};
