"use client";

import PostCard from "@/components/ui/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import UserCard from "@/components/ui/UserCard";
import { TApiErrorResponse } from "@/lib/api";
import { getAllPosts } from "@/lib/api/post";
import { getAllUsers } from "@/lib/api/user";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Dashboard = () => {
  const { push } = useRouter()
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const res = await getAllUsers();
        return res.data.content;
      } catch (error) {
        const err = error as TApiErrorResponse;
        toast.error(err.response?.data.error);
      }
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await getAllPosts();
        return res.data.content;
      } catch (error) {
        const err = error as TApiErrorResponse;
        toast.error(err.response?.data.error);
      }
    },
  });

  return (
    <div className="flex flex-col w-[80vw] max-w-[800px] mx-auto py-5 gap-10">
      <div className="flex flex-col gap-2.5">
        <div>Follow</div>
        <div className="flex gap-2.5 overflow-hidden">
          {!users || !users.length
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
          {!posts || !posts.length
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
            : posts.map((post) => {
                return <PostCard data={post} key={post.id} onClick={() => push(`/post/${post.id}`)} />;
              })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
