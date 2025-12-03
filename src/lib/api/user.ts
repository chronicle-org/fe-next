import { getMethod, postMethod, putMethod, TApiResponse } from ".";
import { TLoginResponse } from "./auth";
import { TPost } from "./post";

const baseUrl = "/user";

export type TResponseUser = Omit<TLoginResponse, "acccess_token">;

export const getUserProfile = (id: number) => {
  return getMethod<TApiResponse<TResponseUser>>(`${baseUrl}/${id}`);
};

export type TUpdatePayload = {
  name?: string;
  banner_url?: string;
  picture_url?: string;
  profile_description?: string;
};

export const updateProfile = (payload: TUpdatePayload) => {
  return putMethod<TUpdatePayload, TApiResponse<TResponseUser>>(
    baseUrl,
    payload
  );
};

export const getAllUsers = () => {
  return getMethod<TApiResponse<TResponseUser[]>>(baseUrl);
};

export type TFollowingAction = "follow" | "unfollow";
export const toggleFollowUser = async (
  userId: number,
  actionType: TFollowingAction
) => {
  return postMethod<undefined, TApiResponse<TLoginResponse>>(
    `${baseUrl}/${actionType}/${userId}`
  );
};

export const getFollowing = async (userId: number) => {
  return getMethod<TApiResponse<TLoginResponse[]>>(
    `${baseUrl}/following/${userId}`
  );
};

export const getFollowers = async (userId: number) => {
  return getMethod<TApiResponse<TLoginResponse[]>>(
    `${baseUrl}/followers/${userId}`
  );
};

export const getLikes = async (userId: number) => {
  return getMethod<TApiResponse<TPost[]>>(`${baseUrl}/likes/${userId}`);
};

export const getBookmarks = async (userId: number) => {
  return getMethod<TApiResponse<TPost[]>>(`${baseUrl}/bookmarks/${userId}`);
};
