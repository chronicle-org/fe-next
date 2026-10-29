"use client";

import { QueryKey } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { ReactNode } from "react";
import { TApiResponsePagination, TPaginationParam } from "@/lib/api";
import { TPost } from "@/lib/api/post";
import { useLoadMoreQuery } from "@/lib/hooks/useLoadMoreQuery";
import PostCard from "./PostCard";
import { LoadMore } from "./LoadMore";
import { Skeleton } from "./skeleton";

/** A list of post cards with skeletons while loading and a "Load more" button. */
export const PostFeed = ({
  queryKey,
  fetchPage,
  empty,
  enabled = true,
}: {
  queryKey: QueryKey;
  fetchPage: (
    params: TPaginationParam,
  ) => Promise<AxiosResponse<TApiResponsePagination<TPost[]>>>;
  empty: ReactNode;
  enabled?: boolean;
}) => {
  const { items, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useLoadMoreQuery({ queryKey, fetchPage, enabled, limit: 10 });

  if (isLoading)
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton className="h-[125px] rounded-xl w-full" key={index} />
        ))}
      </div>
    );

  if (!items.length)
    return (
      <div className="text-muted-foreground py-10 text-center">{empty}</div>
    );

  return (
    <div className="flex flex-col gap-4">
      {items.map((post) => (
        <PostCard data={post} key={post.id} />
      ))}
      <LoadMore
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        onClick={() => fetchNextPage()}
      />
    </div>
  );
};
