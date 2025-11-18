import { getMethod, putMethod, TApiResponse } from ".";
import { TLoginResponse } from "./auth";

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
