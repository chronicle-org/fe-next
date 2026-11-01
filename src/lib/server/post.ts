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

/**
 * The first page of a tag's posts, fetched on the server so tag pages have
 * content for search engines. Falls back to a text search for the tag on an
 * API that doesn't know `tag`/`sort` yet. Null if the API can't be reached.
 */
export const getTagPosts = async (
  tag: string,
  sort: "latest" | "likes" | "views",
  limit = 10,
): Promise<{ data: TPost[]; total: number } | null> => {
  if (!apiUrl) return null;
  const load = async (params: Record<string, string>) => {
    const query = new URLSearchParams({ page: "1", limit: String(limit), ...params });
    const res = await fetch(`${apiUrl}/post?${query}`, {
      next: { revalidate: 300 },
    });
    return res;
  };
  try {
    let res = await load({
      tag,
      ...(sort !== "latest" ? { sort } : {}),
    });
    if (res.status === 400) res = await load({ search: tag });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      content?: { data?: TPost[]; total: number };
    };
    return { data: body.content?.data ?? [], total: body.content?.total ?? 0 };
  } catch {
    return null;
  }
};

/** The most used tags, for the sitemap; empty on an API without them. */
export const getPopularTags = async (
  limit = 100,
): Promise<{ tag: string; count: number }[]> => {
  if (!apiUrl) return [];
  try {
    const res = await fetch(`${apiUrl}/post/tags/popular?limit=${limit}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      content?: { tag: string; count: number }[];
    };
    return body.content ?? [];
  } catch {
    return [];
  }
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
