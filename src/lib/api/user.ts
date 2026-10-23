import {
  getMethod,
  postMethod,
  putMethod,
  TApiResponse,
  TApiResponsePagination,
  TPaginationParam,
} from ".";
import { TLoginResponse } from "./auth";
import { TPost } from "./post";

const baseUrl = "/user";

export type TResponseUser = Omit<TLoginResponse, "access_token">;

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

export const getAllUsers = (params: TPaginationParam) => {
  return getMethod<TApiResponsePagination<TResponseUser[]>>(baseUrl, {
    params,
  });
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

export const getFollowing = async (userId: number, params: TPaginationParam) => {
  return getMethod<TApiResponsePagination<TLoginResponse[]>>(
    `${baseUrl}/following/${userId}`,
    { params }
  );
};

export const getFollowers = async (userId: number, params: TPaginationParam) => {
  return getMethod<TApiResponsePagination<TLoginResponse[]>>(
    `${baseUrl}/followers/${userId}`,
    { params }
  );
};

export const getLikes = async (userId: number, params: TPaginationParam) => {
  return getMethod<TApiResponsePagination<TPost[]>>(
    `${baseUrl}/likes/${userId}`,
    { params }
  );
};

export const getBookmarks = async (userId: number, params: TPaginationParam) => {
  return getMethod<TApiResponsePagination<TPost[]>>(
    `${baseUrl}/bookmarks/${userId}`,
    { params }
  );
};
