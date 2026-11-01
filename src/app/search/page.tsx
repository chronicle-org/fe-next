"use client";

import { PostFeed } from "@/components/ui/PostFeed";
import { parseSort, SortLinks } from "@/components/ui/SortLinks";
import UserCard from "@/components/ui/UserCard";
import { getAllPosts } from "@/lib/api/post";
import { searchUsers } from "@/lib/api/user";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

// /search?q=text finds people and stories. Tags have their own page at
// /tag/name; old /search?tag=name links are sent there.
const Search = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const tag = searchParams.get("tag")?.trim() || "";
  const sort = parseSort(searchParams.get("sort"));
  const { push, replace } = useRouter();

  useEffect(() => {
    if (tag) {
      const suffix = sort === "latest" ? "" : `?sort=${sort}`;
      replace(`/tag/${encodeURIComponent(tag)}${suffix}`);
    } else if (!query) push("/");
  }, [query, tag, sort, push, replace]);

  const { data: people } = useQuery({
    queryKey: ["search", "people", query],
    enabled: !!query,
    queryFn: async () => {
      try {
        const res = await searchUsers(query, { page: 1, limit: 8 });
        return res.data.content?.data ?? [];
      } catch {
        // An API without people search: just show stories.
        return [];
      }
    },
  });

  if (!query || tag) return null;

  return (
    <div className="flex flex-col gap-8 px-5 sm:px-8 py-10 max-w-3xl w-full mx-auto">
      {!!people?.length && (
        <section aria-labelledby="people-heading" className="flex flex-col gap-3">
          <h2
            id="people-heading"
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            People
          </h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {people.map((person) => (
              <UserCard user={person} key={person.id} />
            ))}
          </div>
        </section>
      )}
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <h1 className="font-serif text-2xl font-semibold break-all">
            Stories matching &ldquo;{query}&rdquo;
          </h1>
          <SortLinks path="/search" sort={sort} />
        </div>
        <PostFeed
          queryKey={["search", { query, sort }]}
          fetchPage={(params) => getAllPosts({ ...params, search: query, sort })}
          empty="No stories match that search."
        />
      </section>
    </div>
  );
};

export default Search;
