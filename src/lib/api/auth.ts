import { deleteMethod, postMethod, putMethod, TApiResponse } from ".";

export type TLoginPayload = {
  email: string;
  password: string;
};

export type TLoginResponse = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  picture_url?: string;
  banner_url?: string;
  handle: string;
  // In the login response only; never stored in the readable user cookie.
  access_token?: string;
  profile_description?: string;
  tags?: string;
  following?: number[];
  following_count: number;
  followers?: number[];
  followers_count: number;
  likes?: number[];
  likes_count: number;
  bookmarks?: number[];
  bookmarks_count: number;
};

export type TRegisterPayload = TLoginPayload & {
  name: string;
};

const baseUrl = "/auth";

export const logUserIn = (payload: TLoginPayload) => {
  return postMethod<TLoginPayload, TApiResponse<TLoginResponse>>(
    `${baseUrl}/login`,
    payload
  );
};

export const registerUser = (payload: TRegisterPayload) => {
  return postMethod<TRegisterPayload, TApiResponse<Partial<TLoginResponse>>>(
    `${baseUrl}/register`,
    payload
  );
};

export const logUserOut = () => {
  return postMethod<TLoginPayload, TApiResponse<TLoginResponse>>(
    `${baseUrl}/logout`
  );
};

export type TChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export const changePassword = (payload: TChangePasswordPayload) => {
  return putMethod<TChangePasswordPayload, TApiResponse<{ message: string }>>(
    `${baseUrl}/password`,
    payload
  );
};

export const deleteAccount = (password: string) => {
  return deleteMethod<TApiResponse<{ message: string }>>(`${baseUrl}/account`, {
    data: { password },
  });
};
