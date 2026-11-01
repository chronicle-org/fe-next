"use client";

import { Skeleton } from "@/components/ui/skeleton";
import UserCard from "@/components/ui/UserCard";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { getAllPosts, getFollowingFeed } from "@/lib/api/post";
import { getSuggestedUsers } from "@/lib/api/user";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useStore } from "zustand";
import { useUserStore } from "@/lib/stores/user.store";
import { useState } from "react";
import { PostFeed } from "@/components/ui/PostFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FEEDS = [
  { value: "following", label: "Following" },
  { value: "latest", label: "Latest" },
  { value: "likes", label: "Popular" },
] as const;
type TFeed = (typeof FEEDS)[number]["value"];

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

  const followsSomeone = useStore(
    useUserStore,
    (s) => (s.user?.following_count ?? 0) > 0,
  );
  const [feed, setFeed] = useState<TFeed | null>(null);
  // Start on Following once we know there's something to show there.
  const activeFeed = feed ?? (followsSomeone ? "following" : "latest");

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-5 sm:px-8 py-10 gap-10">
      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Who to follow
        </h2>
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
      <Tabs
        value={activeFeed}
        onValueChange={(value) => setFeed(value as TFeed)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <h2 className="font-serif text-2xl font-semibold">Stories</h2>
          <TabsList>
            {FEEDS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="following">
          <PostFeed
            queryKey={["posts", "following", viewerId]}
            fetchPage={getFollowingFeed}
            empty={
              <>
                Nothing here yet. Follow a few writers above and their new
                stories will show up here.
              </>
            }
          />
        </TabsContent>
        <TabsContent value="latest">
          <PostFeed
            queryKey={["posts", "feed", "latest"]}
            fetchPage={(params) => getAllPosts({ ...params, search: "" })}
            empty="No stories yet."
          />
        </TabsContent>
        <TabsContent value="likes">
          <PostFeed
            queryKey={["posts", "feed", "likes"]}
            fetchPage={(params) =>
              getAllPosts({ ...params, search: "", sort: "likes" })
            }
            empty="No stories yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
