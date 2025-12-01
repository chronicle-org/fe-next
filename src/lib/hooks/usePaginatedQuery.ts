import { useState, useCallback } from "react";
import {
  useQuery,
  QueryKey,
  UseQueryOptions,
  keepPreviousData,
} from "@tanstack/react-query";
import { debounce } from "../utils";
import { AxiosResponse } from "axios";
import { TApiErrorResponse, TApiResponsePagination } from "../api";

// interface TApiResponsePagination<T> {
//   data: T | null;
//   total: number;
// }
// interface AxiosResponse<T> {
//   data: T;
//   status: number;
// }

type PaginationState<TFilters extends Record<string, any>> = {
  currentPage: number;
  limit: number;
  lastPage: number;
  count: number;
  filters: TFilters;
};
type FetchFunctionParams<TFilters extends Record<string, any>> = {
  page: number;
  limit: number;
  filters: TFilters;
};

type TUsePaginationQueryOptions<
  TQueryData,
  TFilters extends Record<string, any>
> = {
  limit?: number;
  fetchOnce?: boolean;
  fetchFunction: (
    params: FetchFunctionParams<TFilters>
  ) => Promise<AxiosResponse<TApiResponsePagination<TQueryData>>>;
  queryKey: (state: PaginationState<TFilters>) => QueryKey;
  onError?: (err: TApiErrorResponse) => void;
  initPage?: number;
  initFilters: TFilters;
  cbSuccess?: (data?: TQueryData | null) => void;
} & Omit<
  UseQueryOptions<TQueryData | []>,
  "queryKey" | "queryFn" | "placeholderData" | "onError"
>;

export function usePaginationQuery<
  TQueryData,
  TFilters extends Record<string, any>
>({
  limit: initialLimit = 10,
  fetchOnce = false,
  enabled = true,
  fetchFunction,
  queryKey: queryKeyGenerator,
  onError,
  initPage = 1,
  initFilters,
  cbSuccess,
  ...restOptions
}: TUsePaginationQueryOptions<TQueryData, TFilters>) {
  const [fetchTrigger, setFetchTrigger] = useState(fetchOnce);

  const [paginationState, setPaginationState] = useState<
    PaginationState<TFilters>
  >({
    currentPage: initPage,
    limit: initialLimit,
    lastPage: -1,
    count: 0,
    filters: initFilters,
  });

  const { currentPage, limit, filters, lastPage, count } = paginationState;
  const setFilters = useCallback(
    (newFilters: Partial<TFilters>, debounceFilter?: number) => {
      setPaginationState((prev) => ({
        ...prev,
        filters: { ...prev.filters, ...newFilters },
        currentPage: 1,
      }));

      if (fetchOnce) {
        if (debounceFilter) {
          const debounceStartFetch = debounce(
            () => setFetchTrigger(true),
            debounceFilter
          );
          debounceStartFetch();
        } else {
          setFetchTrigger(true);
        }
      }
    },
    [fetchOnce]
  );

  const movePage = useCallback(
    ({
      page,
      increment = 0,
      debouncePagination,
    }: {
      page?: number;
      increment?: number;
      debouncePagination?: number;
    }) => {
      if (!page && !increment) return;

      const newPage = page || increment + currentPage;

      if (lastPage > 0 && newPage > lastPage) return;
      if (newPage < 1) return;

      setPaginationState((prev) => ({
        ...prev,
        currentPage: newPage,
      }));

      if (fetchOnce) {
        if (debouncePagination) {
          const debounceMovePage = debounce(
            () => setFetchTrigger(true),
            debouncePagination
          );
          debounceMovePage();
        } else setFetchTrigger(true);
      }
    },
    [fetchOnce, currentPage, lastPage]
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      setPaginationState((prev) => ({
        ...prev,
        limit: newLimit,
        currentPage: 1,
      }));
      fetchOnce && setFetchTrigger(true);
    },
    [fetchOnce]
  );

  const query = useQuery<TQueryData | []>({
    ...restOptions,
    enabled: enabled && (fetchOnce ? fetchTrigger : true),
    placeholderData: keepPreviousData,
    queryKey: queryKeyGenerator(paginationState),

    queryFn: async () => {
      try {
        const response = await fetchFunction({
          page: currentPage,
          limit,
          filters,
        });

        if (response.status > 299) throw new Error("API request failed");

        const apiData = response.data.content?.data;
        const totalCount = response.data.content?.total;

        setPaginationState((prev) => ({
          ...prev,
          lastPage: totalCount ? Math.ceil(totalCount / limit) : 1,
          count: totalCount || 0,
        }));

        fetchOnce && setFetchTrigger(false);
        cbSuccess?.(apiData);

        return apiData || [];
      } catch (error) {
        fetchOnce && setFetchTrigger(false);
        const err = error as TApiErrorResponse;
        onError?.(err);
        return [];
      }
    },
  });

  const resetPage = useCallback(() => {
    setPaginationState({
      currentPage: 1,
      lastPage: -1,
      count: 0,
      limit: initialLimit,
      filters: initFilters,
    });
    fetchOnce && setFetchTrigger(true);
  }, [fetchOnce, initialLimit, initFilters]);

  const totalPages =
    lastPage === -1 ? (count > 0 ? Math.ceil(count / limit) : 1) : lastPage;

  return {
    ...query,
    resetPage,
    setFilters,
    setLimit,
    pagination: {
      ...paginationState,
      totalPages: totalPages,
    },
    movePage,
  };
}
