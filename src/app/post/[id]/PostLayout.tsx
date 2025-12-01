"use client";

import { BlogEditor } from "@/app/profile/ProfileLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { TApiErrorResponse } from "@/lib/api";
import { findOne } from "@/lib/api/post";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const PostLayout = ({ id }: { id?: number }) => {
  const { push, back } = useRouter();

  const { data, isFetching } = useQuery({
    enabled: id !== undefined,
    queryKey: [`post-data-${id}`],
    queryFn: async () => {
      try {
        const res = await findOne(Number(id));
        if (!res.data.content) throw new Error();
        return res.data.content;
      } catch (error) {
        const err = error as TApiErrorResponse;
        toast.error(err.response?.data.error);
        push("/dashboard");
      }
    },
  });

  if (isFetching || !id) return <PostSkeleton />;

  return (
    <div className="py-10 max-w-[90vw] mx-auto w-full">
      <BlogEditor data={data} isVisit onBack={() => back()} isPostView />
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
