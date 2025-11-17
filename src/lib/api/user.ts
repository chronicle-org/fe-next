import { getMethod, putMethod, TApiResponse } from ".";
import { TLoginResponse } from "./auth";

const baseUrl = "/user";

export const getUserProfile = (id: number) => {
  return getMethod<TApiResponse<TLoginResponse>>(`${baseUrl}/${id}`);
};

export type TUpdatePayload = {
  name?: string;
  banner_url?: string;
  picture_url?: string;
  profile_description?: string;
};

export const updateProfile = (payload: TUpdatePayload) => {
  return putMethod(baseUrl, payload);
};

export const getAllUsers = () => {
  return getMethod<TApiResponse<Omit<TLoginResponse, "acccess_token">[]>>(
    baseUrl
  );
};
