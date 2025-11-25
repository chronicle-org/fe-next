"use client";

import { CommentIcon } from "@/components/Icons";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { TApiErrorResponse } from "@/lib/api";
import { getAllByPostId, postComment } from "@/lib/api/comment";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export const CommentSection = ({
    postId,
    userId,
}: {
    postId?: number;
    userId?: number;
}) => {
    const [comment, setComment] = useState("");

    const { data: comments, refetch: refetchComments } = useQuery({
        enabled: !!postId,
        queryKey: [`post-${postId}-comments`],
        queryFn: async () => {
            try {
                const res = await getAllByPostId(postId as number);
                return res.data.content;
            } catch (error) {
                const err = error as TApiErrorResponse;
                toast.error(err.response?.data.error);
            }
        },
    });

    const { mutate: post, isPending: isPosting } = useMutation({
        mutationFn: () =>
            postComment({ user_id: userId!, post_id: postId!, content: comment }),
        onSuccess: async () => {
            toast.success("Comment posted");
            setComment("");
            refetchComments();
        },
        onError: (error: TApiErrorResponse) => {
            toast.error(error.response?.data.error);
        },
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className="flex flex-col gap-10 w-full max-w-[800px] mx-auto">
            <div className="text-end">{comments?.length || 0} Comments</div>
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
            {!comments || !comments.length ? (
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
                                "p-2.5 text-sm flex gap-10"
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
                        </div>
                    );
                })
            )}
        </div>
    );
};
