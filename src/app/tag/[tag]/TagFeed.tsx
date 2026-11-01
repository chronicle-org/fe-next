"use client";

import { PostFeed } from "@/components/ui/PostFeed";
import { SortLinks } from "@/components/ui/SortLinks";
import { getAllPosts, TPost, TPostSort } from "@/lib/api/post";

/** A tag's stories; the first page comes from the server so it's indexable. */
const TagFeed = ({
  tag,
  sort,
  initialPage,
}: {
  tag: string;
  sort: TPostSort;
  initialPage?: { data: TPost[]; total: number };
}) => (
  <div className="flex flex-col gap-5 px-5 sm:px-8 py-10 max-w-3xl w-full mx-auto">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
      <h1 className="font-serif text-2xl font-semibold break-all">#{tag}</h1>
      <SortLinks path={`/tag/${encodeURIComponent(tag)}`} sort={sort} />
    </div>
    <PostFeed
      queryKey={["tag", tag, sort]}
      fetchPage={(params) => getAllPosts({ ...params, search: "", tag, sort })}
      initialPage={initialPage}
      empty="No stories with this tag yet."
    />
  </div>
);

export default TagFeed;
