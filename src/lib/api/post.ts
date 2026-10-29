import { AxiosResponse } from "axios";
import {
  deleteMethod,
  getMethod,
  postMethod,
  putMethod,
  TApiErrorResponse,
  TApiResponse,
  TApiResponsePagination,
  TPaginationParam,
} from ".";
import { InteractionType } from "../types";
import { TLoginResponse } from "./auth";

const baseUrl = "/post";

export type TPost = {
  id: number;
  user_id: number;
  title: string;
  sub_title: string;
  content: string;
  thumbnail_url: string;
  comment_count: number;
  created_at: string;
  updated_at: string;
  visibility: boolean;
  tags: string;
  bookmarks_count: number;
  bookmarks: number[];
  share_count: number;
  view_count: number;
  likes_count: number;
  likes: number[];
  is_draft: boolean;
  reading_time: number;
  user: Partial<TLoginResponse>;
};

export type TPostSort = "latest" | "likes" | "views";

type TFetchFunctionParams = TPaginationParam & {
  search: string;
  tag?: string;
  sort?: TPostSort;
};

const listParams = ({ page, limit, search, tag, sort }: TFetchFunctionParams) => ({
  page,
  limit,
  search,
  // Only sent when used: an API without tag/sort support rejects them.
  ...(tag ? { tag } : {}),
  ...(sort && sort !== "latest" ? { sort } : {}),
});

export const getAllPosts = async (params: TFetchFunctionParams) => {
  try {
    return await getMethod<TApiResponsePagination<TPost[]>>(baseUrl, {
      params: listParams(params),
    });
  } catch (error) {
    // Until the API knows tag and sort, fall back to a text search for the
    // tag in newest-first order.
    const usesNewParams = !!params.tag || (params.sort ?? "latest") !== "latest";
    if (!usesNewParams || (error as TApiErrorResponse).response?.status !== 400)
      throw error;
    return getMethod<TApiResponsePagination<TPost[]>>(baseUrl, {
      params: listParams({
        ...params,
        search: params.search || params.tag || "",
        tag: undefined,
        sort: undefined,
      }),
    });
  }
};

/** Posts from the writers the signed-in user follows. */
export const getFollowingFeed = async (params: TPaginationParam) => {
  try {
    return await getMethod<TApiResponsePagination<TPost[]>>(
      `${baseUrl}/feed/following`,
      { params }
    );
  } catch (error) {
    // An API from before the feed existed has no such route; show it empty.
    const response = (error as TApiErrorResponse).response;
    if (response?.status !== 404) throw error;
    return {
      ...response,
      data: { ...response.data, content: { data: [], total: 0 } },
    } as AxiosResponse<TApiResponsePagination<TPost[]>>;
  }
};

/** Posts to read next after this one. */
export const getRelatedPosts = async (id: number, limit = 3) => {
  return getMethod<TApiResponse<TPost[]>>(`${baseUrl}/${id}/related`, {
    params: { limit },
  });
};

export const getAllPostsByUser = async (
  id: number,
  params: TFetchFunctionParams
) => {
  return getMethod<TApiResponsePagination<TPost[]>>(
    `${baseUrl}/user/${id}?page=${params.page}&limit=${params.limit}&search=${params.search}`
  );
};

export const findOne = async (id: number) => {
  return getMethod<TApiResponse<TPost>>(`${baseUrl}/${id}`);
};

export type TAddPostPayload = Pick<
  TPost,
  "title" | "sub_title" | "thumbnail_url" | "content"
> & {
  tags?: string;
  is_draft?: boolean;
};
export const addPost = async (payload: TAddPostPayload) => {
  return postMethod<typeof payload, TApiResponse<TPost>>(`${baseUrl}`, payload);
};

export const editPost = async (
  id: number,
  payload: Partial<TAddPostPayload>
) => {
  return putMethod<typeof payload, TApiResponse<TPost>>(
    `${baseUrl}/${id}`,
    payload
  );
};

export const deletePost = async (id: number) => {
  return deleteMethod<TApiResponse<TPost>>(`${baseUrl}/${id}`);
};

export const updateInteraction = (
  actionType: InteractionType,
  postId: number
) => {
  return putMethod<
    undefined,
    TApiResponse<{ post: TPost; user: TLoginResponse }>
  >(`${baseUrl}/interaction/${actionType}/${postId}`);
};

export const updateCounter = (
  actionType: "view" | "share",
  postId: number
) => {
  return putMethod<
    undefined,
    TApiResponse<{ post: TPost; user: TLoginResponse }>
  >(`${baseUrl}/counter/${actionType}/${postId}`);
};

export const getDrafts = async (
  userId: number,
  params: TFetchFunctionParams
) => {
  return getMethod<TApiResponsePagination<TPost[]>>(
    `${baseUrl}/user/${userId}/drafts?page=${params.page}&limit=${params.limit}`
  );
};

export const publishDraft = async (postId: number) => {
  return putMethod<undefined, TApiResponse<TPost>>(
    `${baseUrl}/${postId}/publish`,
    undefined
  );
};