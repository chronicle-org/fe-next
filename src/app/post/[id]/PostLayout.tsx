"use client";

import { BlogEditor } from "@/app/profile/BlogEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { RelatedPosts } from "@/components/ui/RelatedPosts";
import { PostNotFound } from "@/components/ui/ErrorState";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { findOne, TPost } from "@/lib/api/post";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const PostLayout = ({
  id,
  initialPost,
}: {
  id?: number;
  initialPost?: TPost;
}) => {
  const { push, back } = useRouter();
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    enabled: id !== undefined,
    queryKey: [`post-data-${id}`],
    initialData: initialPost,
    // Server-fetched copy is fresh enough; skip an immediate refetch.
    staleTime: initialPost ? 60_000 : 0,
    queryFn: async () => {
      try {
        const res = await findOne(Number(id));
        if (!res.data.content) return null;
        return res.data.content;
      } catch (error) {
        const err = error as TApiErrorResponse;
        // Deleted posts and other people's drafts get a proper 404 page.
        if (err.response?.status === 404) return null;
        toast.error(getApiErrorMessage(err));
        push("/dashboard");
      }
    },
  });

  if (!id || (isFetching && !data)) return <PostSkeleton />;
  if (data === null) return <PostNotFound />;

  return (
    <div className="py-10 max-w-[90vw] mx-auto w-full">
      <BlogEditor
        data={data}
        isVisit
        onBack={() => {
          if (window.history.length > 1) {
            back();
          } else {
            push("/dashboard");
          }
        }}
        isPostView
        onUpdatePostCounter={(post) =>
          queryClient.setQueryData([`post-data-${id}`], post)
        }
      />
      {data && !data.is_draft && <RelatedPosts postId={data.id} />}
    </div>
  );
};

export default PostLayout;

export const PostSkeleton = () => {
  return (
    <div className="w-full max-w-[800px] mx-auto flex flex-col gap-10 py-5">
      <div className="flex gap-5 items-center">
        <div className="flex flex-col gap-2.5 w-full">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-[200px] aspect-square" />
      </div>

      <Skeleton className="w-full aspect-square" />
    </div>
  );
};
