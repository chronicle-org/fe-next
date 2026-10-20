import {
  deleteMethod,
  getMethod,
  postMethod,
  TApiResponse,
  TApiResponsePagination,
  TPaginationParam,
} from ".";
import { TLoginResponse } from "./auth";

const baseUrl = "/comment";

export type TComment = {
  id: number;
  user_id: number;
  user: TLoginResponse;
  post_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
};

export const getAllByPostId = (postId: number, params: TPaginationParam) => {
  return getMethod<TApiResponsePagination<TComment[]>>(
    `${baseUrl}/post/${postId}`,
    { params }
  );
};

export const postComment = (
  payload: Pick<TComment, "post_id" | "content">
) => {
  return postMethod<typeof payload, TApiResponse<TComment>>(
    `${baseUrl}`,
    payload
  );
};

export const deleteComment = (id: number) => {
  return deleteMethod<TApiResponse<TComment>>(`${baseUrl}/${id}`);
};
