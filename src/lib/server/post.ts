import { cache } from "react";
import type { TPost } from "@/lib/api/post";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Public site origin, used for absolute URLs in metadata and the sitemap.
 * Falls back to the Vercel production domain when NEXT_PUBLIC_SITE_URL is unset.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined)
)?.replace(/\/$/, "");

/**
 * Fetches a published post on the server for metadata and the first render.
 * Anonymous, so drafts come back as null and load on the client instead.
 */
export const getPublicPost = cache(async (id: number): Promise<TPost | null> => {
  if (!apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/post/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { content?: TPost | null };
    return body.content ?? null;
  } catch {
    return null;
  }
});

/** Lists recent published posts for the sitemap. */
export const getRecentPosts = async (pages = 5, limit = 50): Promise<TPost[]> => {
  if (!apiUrl) return [];
  const posts: TPost[] = [];
  for (let page = 1; page <= pages; page++) {
    try {
      const res = await fetch(`${apiUrl}/post?page=${page}&limit=${limit}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const body = (await res.json()) as {
        content?: { data?: TPost[]; total: number };
      };
      const data = body.content?.data ?? [];
      posts.push(...data);
      if (data.length < limit) break;
    } catch {
      break;
    }
  }
  return posts;
};

export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export const excerpt = (html: string, max = 160): string => {
  const text = stripHtml(html);
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
};
