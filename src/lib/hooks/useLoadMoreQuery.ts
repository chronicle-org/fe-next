import { QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { toast } from "sonner";
import {
  TApiErrorResponse,
  TApiResponsePagination,
  TPaginationParam,
  getApiErrorMessage,
} from "../api";

export const LOAD_MORE_LIMIT = 20;

/**
 * Pages through a `{ data, total }` list endpoint, keeping every loaded page
 * so the UI can show a "Load more" button under the items loaded so far.
 */
export function useLoadMoreQuery<TItem>({
  queryKey,
  fetchPage,
  enabled = true,
  limit = LOAD_MORE_LIMIT,
}: {
  queryKey: QueryKey;
  fetchPage: (
    params: TPaginationParam,
  ) => Promise<AxiosResponse<TApiResponsePagination<TItem[]>>>;
  enabled?: boolean;
  limit?: number;
}) {
  const query = useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      try {
        const res = await fetchPage({ page: pageParam, limit });
        return {
          data: res.data.content?.data ?? [],
          total: res.data.content?.total ?? 0,
        };
      } catch (error) {
        const err = error as TApiErrorResponse;
        toast.error(getApiErrorMessage(err));
        throw error;
      }
    },
    getNextPageParam: (lastPage, pages) =>
      pages.length * limit < lastPage.total ? pages.length + 1 : undefined,
  });

  return {
    items: query.data?.pages.flatMap((page) => page.data) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
