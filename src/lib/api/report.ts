import {
  getMethod,
  postMethod,
  putMethod,
  TApiResponse,
  TApiResponsePagination,
  TPaginationParam,
} from ".";
import { TLoginResponse } from "./auth";
import { TComment } from "./comment";
import { TPost } from "./post";

const baseUrl = "/report";

export const REPORT_REASONS = {
  spam: "Spam or ads",
  harassment: "Harassment or bullying",
  hate: "Hate speech",
  sexual: "Sexual content",
  violence: "Violence or threats",
  misinformation: "False information",
  other: "Something else",
} as const;
export type TReportReason = keyof typeof REPORT_REASONS;
export type TReportStatus = "open" | "removed" | "dismissed";

export type TReport = {
  id: number;
  reporter_id: number;
  post_id: number | null;
  comment_id: number | null;
  reason: TReportReason;
  details: string;
  status: TReportStatus;
  created_at: string;
  reporter: TLoginResponse;
  post: TPost | null;
  comment: (TComment & { user: TLoginResponse }) | null;
};

export type TReportPayload = (
  | { post_id: number; comment_id?: never }
  | { comment_id: number; post_id?: never }
) & { reason: TReportReason; details?: string };

export const createReport = (payload: TReportPayload) => {
  return postMethod<TReportPayload, TApiResponse<{ message: string }>>(
    baseUrl,
    payload
  );
};

export const getReportAccess = () => {
  return getMethod<TApiResponse<{ is_admin: boolean }>>(`${baseUrl}/access`);
};

export const getReports = (
  status: TReportStatus,
  params: TPaginationParam
) => {
  return getMethod<TApiResponsePagination<TReport[]>>(baseUrl, {
    params: { ...params, status },
  });
};

export const resolveReport = (id: number, status: "removed" | "dismissed") => {
  return putMethod<{ status: string }, TApiResponse<{ message: string }>>(
    `${baseUrl}/${id}`,
    { status }
  );
};
