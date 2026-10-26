"use client";

import PostCard from "@/components/ui/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import UserCard from "@/components/ui/UserCard";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { getAllPosts } from "@/lib/api/post";
import { getSuggestedUsers } from "@/lib/api/user";
import { usePaginationQuery } from "@/lib/hooks/usePaginatedQuery";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useStore } from "zustand";
import { useUserStore } from "@/lib/stores/user.store";

const Dashboard = () => {
  const viewerId = useStore(useUserStore, (s) => s.user?.id);
  // Suggestions depend on who's looking.
  const { data: users } = useQuery({
    queryKey: ["users", "suggestions", viewerId],
    queryFn: async () => {
      try {
        return await getSuggestedUsers(20);
      } catch (error) {
        const err = error as TApiErrorResponse;
        toast.error(getApiErrorMessage(err));
      }
    },
  });

  const { data: posts, isLoading } = usePaginationQuery({
    queryKey: (state) => ["posts", state],
    fetchFunction: async (params) => {
      const { filters, ...rest } = params;
      return getAllPosts({
        ...rest,
        search: filters.search,
      });
    },
    fetchOnce: true,
    initPage: 1,
    initFilters: {
      search: "",
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <div className="flex flex-col w-[80vw] max-w-[800px] mx-auto py-5 gap-10">
      <div className="flex flex-col gap-2.5">
        <div>Follow</div>
        <div className="flex gap-2.5 overflow-hidden overflow-x-auto">
          {users && !users.length ? (
            <div className="text-sm text-muted-foreground">
              No one to suggest yet.
            </div>
          ) : !users
            ? Array(5)
                .fill("")
                .map((_, index) => {
                  return (
                    <Skeleton
                      className="h-[125px] aspect-square rounded-xl"
                      key={index}
                    />
                  );
                })
            : users.map((user) => {
                return <UserCard user={user} key={user.id} />;
              })}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <div>Posts</div>
        <div className="flex flex-col gap-2.5 overflow-hidden">
          {isLoading
            ? Array(5)
                .fill("")
                .map((_, index) => {
                  return (
                    <Skeleton
                      className="h-[125px] rounded-xl w-full"
                      key={index}
                    />
                  );
                })
            : posts?.map((post) => {
                return (
                  <PostCard
                    data={post}
                    key={post.id}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
