"use client";

import { InfiniteScroll } from "@/components/ui/InfiniteScroll";
import PostCard from "@/components/ui/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllPosts } from "@/lib/api/post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";

const limit = 10;

const Search = () => {
  const searchParams = useSearchParams();
  const query = decodeURIComponent(searchParams.get("q") || "");
  const { push } = useRouter();

  if (!query) push("/");

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["search", query],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      return getAllPosts({
        page: pageParam,
        limit,
        search: query as string,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;

      const loadedContent = allPages
        .map((page) => page.data.content?.data?.length)
        .reduce((a, b) => (a || 0) + (b || 0), 0);
      if ((loadedContent || 0) < (lastPage.data.content?.total || 0)) {
        return currentPage + 1;
      }
      return undefined;
    },
  });

  const posts = data?.pages
    ?.map((response) => response.data.content?.data)
    .flat();
  return (
    <div className="flex flex-col gap-2.5 p-5 md:max-w-[800px] w-full mx-auto">
      <p>Result</p>
      <div className="flex flex-col gap-2.5 overflow-hidden w-full">
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
          : posts?.map((post, index) => {
              if (!post)
                return (
                  <Skeleton
                    className="h-[125px] rounded-xl w-full"
                    key={index}
                  />
                );
              return (
                <PostCard
                  data={post}
                  key={post.id}
                  onClick={() => push(`/post/${post.id}`)}
                />
              );
            })}
        {!isLoading && (
          <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage} />
        )}
      </div>
    </div>
  );
};

export default Search;
