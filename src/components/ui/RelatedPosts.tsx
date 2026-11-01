"use client";

import { useQuery } from "@tanstack/react-query";
import { getRelatedPosts } from "@/lib/api/post";
import PostCard from "./PostCard";

/** "More like this" under a post; hidden when there's nothing to suggest. */
export const RelatedPosts = ({ postId }: { postId: number }) => {
  const { data: posts } = useQuery({
    queryKey: ["posts", "related", postId],
    queryFn: async () => {
      try {
        const res = await getRelatedPosts(postId, 3);
        return res.data.content ?? [];
      } catch {
        // Suggestions are optional; a failure just hides the section.
        return [];
      }
    },
  });

  if (!posts?.length) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className="w-full max-w-[800px] mx-auto flex flex-col gap-4 pt-10"
    >
      <h2
        id="related-heading"
        className="font-serif text-2xl font-semibold border-b border-border pb-3"
      >
        More like this
      </h2>
      {posts.map((post) => (
        <PostCard data={post} key={post.id} />
      ))}
    </section>
  );
};
