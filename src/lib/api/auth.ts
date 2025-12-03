import { postMethod, TApiResponse } from ".";

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
  access_token: string;
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

const baseUrl = "/auth";

export const logUserIn = (payload: TLoginPayload) => {
  return postMethod<TLoginPayload, TApiResponse<TLoginResponse>>(
    `${baseUrl}/login`,
    payload
  );
};

export const logUserOut = () => {
  return postMethod<TLoginPayload, TApiResponse<TLoginResponse>>(
    `${baseUrl}/logout`
  );
};
