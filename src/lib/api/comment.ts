import { getMethod, postMethod, TApiResponse } from ".";
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

export const getAllByPostId = (postId: number) => {
  return getMethod<TApiResponse<TComment[]>>(`${baseUrl}/${postId}`);
};

export const postComment = (
  payload: Pick<TComment, "user_id" | "post_id" | "content">
) => {
  return postMethod<typeof payload, TApiResponse<TComment>>(
    `${baseUrl}`,
    payload
  );
};
