import type { MetadataRoute } from "next";
import { getRecentPosts, siteUrl } from "@/lib/server/post";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteUrl) return [];
  const posts = await getRecentPosts();
  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    ...posts.map((post) => ({
      url: `${siteUrl}/post/${post.id}`,
      lastModified: post.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
