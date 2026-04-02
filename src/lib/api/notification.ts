import {
  deleteMethod,
  getMethod,
  putMethod,
  TApiResponse,
  TApiResponsePagination,
  TPaginationParam,
} from ".";
import { TLoginResponse } from "./auth";
import { TPost } from "./post";

const baseUrl = "/notifications";

export const NOTIFICATION_TYPE = {
  1: "COMMENT",
  2: "LIKE",
  3: "FOLLOW",
  4: "BOOKMARK",
  5: "REPLY",
  6: "POST",
};

export const NOTIFICATION_TYPE_ENUM = {
  COMMENT: 1,
  LIKE: 2,
  FOLLOW: 3,
  BOOKMARK: 4,
  REPLY: 5,
  POST: 6,
};

export type TNotificationType = keyof typeof NOTIFICATION_TYPE;

export type TNotificationTypeEnum = keyof typeof NOTIFICATION_TYPE_ENUM;

export type TNotificationItem = {
  id: number;
  recipient_id: number;
  actor_id: number;
  type: TNotificationType;
  post_id: number | null;
  comment_id: number | null;
  message: string | null;
  read: boolean;
  read_at: Date | null;
  deleted: boolean;
  deleted_at: Date | null;
  created_at: Date;
  recipient: TLoginResponse;
  actor: TLoginResponse;
  post: TPost | null;
};

export type TNotificationSettingsPayload = {
  notify_comments: boolean;
  notify_likes: boolean;
  notify_follows: boolean;
  notify_bookmarks: boolean;
  notify_replies: boolean;
  notify_followed_posts_enabled: boolean;
  notify_followed_posts_from_users: number[];
}

export type TNotificationSettings = TNotificationSettingsPayload & {
  id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  user: TLoginResponse;
}

export const getNotifications = async (params: TPaginationParam) => {
  return getMethod<TApiResponsePagination<TNotificationItem[]>>(baseUrl, {
    params,
  });
};

export const deleteNotification = async (id: number) => {
  return deleteMethod<TApiResponse>(`${baseUrl}/${id}`);
};

export const markNotificationsAsRead = async (ids: number[]) => {
  return putMethod<{ ids: number[] }, TApiResponse<TNotificationItem[]>>(`${baseUrl}/read`, { ids });
};

export const getNotificationSettings = async () => {
  return getMethod<TApiResponse<TNotificationSettings>>(`${baseUrl}/settings`);
}

export const updateNotificationSettings = async (settings: Partial<TNotificationSettingsPayload>) => {
  return putMethod<Partial<TNotificationSettingsPayload>, TApiResponse<TNotificationSettings>>(`${baseUrl}/settings`, settings);
}