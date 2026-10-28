import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostLayout from "./PostLayout";
import { excerpt, getPublicPost, siteUrl, stripHtml } from "@/lib/server/post";
import { parseTags } from "@/lib/tags";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = Number.isNaN(parseInt(id)) ? null : await getPublicPost(Number(id));
  if (!post) return { title: "Chronicle" };

  const title = stripHtml(post.title) || "Untitled";
  const description =
    excerpt(post.sub_title) || excerpt(post.content) || "Read on Chronicle.";
  const url = siteUrl ? `${siteUrl}/post/${post.id}` : undefined;
  const tags = parseTags(post.tags);

  return {
    title: `${title} | Chronicle`,
    description,
    keywords: tags.length ? tags : undefined,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      // The image comes from opengraph-image.tsx next to this page.
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: post.user?.name ? [post.user.name] : undefined,
      tags: tags.length ? tags : undefined,
      siteName: "Chronicle",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const Post = async ({ params }: Props) => {
  const param = await params;

  if (!/^\d+$/.test(param.id)) notFound();

  const id = Number(param.id);
  // Server-rendered so crawlers and link previews get the article, not a skeleton.
  const initialPost = await getPublicPost(id);

  return (
    <>
      {initialPost && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: stripHtml(initialPost.title),
              description: excerpt(initialPost.sub_title || initialPost.content),
              image: initialPost.thumbnail_url || undefined,
              datePublished: initialPost.created_at,
              dateModified: initialPost.updated_at,
              keywords: parseTags(initialPost.tags).join(", ") || undefined,
              author: initialPost.user?.name
                ? { "@type": "Person", name: initialPost.user.name }
                : undefined,
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <PostLayout id={id} initialPost={initialPost ?? undefined} />
    </>
  );
};

export default Post;
