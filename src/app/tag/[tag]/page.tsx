import type { Metadata } from "next";
import { getTagPosts, siteUrl } from "@/lib/server/post";
import TagFeed from "./TagFeed";

type Props = {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ sort?: string }>;
};

const SORTS = ["latest", "likes", "views"] as const;
type Sort = (typeof SORTS)[number];
const parseSort = (value?: string): Sort =>
  SORTS.includes(value as Sort) ? (value as Sort) : "latest";

const tagFrom = async (params: Props["params"]) =>
  decodeURIComponent((await params).tag).trim().toLowerCase();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await tagFrom(params);
  const title = `#${tag} stories | Chronicle`;
  const description = `Read stories tagged #${tag} on Chronicle.`;
  const url = siteUrl ? `${siteUrl}/tag/${encodeURIComponent(tag)}` : undefined;
  return {
    title,
    description,
    // Sorted views are the same stories in another order.
    alternates: url ? { canonical: url } : undefined,
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const tag = await tagFrom(params);
  const sort = parseSort((await searchParams).sort);
  const initialPage = await getTagPosts(tag, sort);
  return <TagFeed tag={tag} sort={sort} initialPage={initialPage ?? undefined} />;
}
