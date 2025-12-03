import {
  deleteMethod,
  getMethod,
  postMethod,
  putMethod,
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
  user: Partial<TLoginResponse>;
};

type TFetchFunctionParams = TPaginationParam & {
  search: string;
};

export const getAllPosts = async (params: TFetchFunctionParams) => {
  return getMethod<TApiResponsePagination<TPost[]>>(
    `${baseUrl}?page=${params.page}&limit=${params.limit}&search=${params.search}`
  );
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
>;
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
