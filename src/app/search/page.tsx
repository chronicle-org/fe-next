"use client";

import { PostFeed } from "@/components/ui/PostFeed";
import { getAllPosts, TPostSort } from "@/lib/api/post";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SORTS: { value: TPostSort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "likes", label: "Most liked" },
  { value: "views", label: "Most viewed" },
];

// /search?q=text searches titles and tags; /search?tag=name lists one tag.
const Search = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const tag = searchParams.get("tag")?.trim() || "";
  const sortParam = searchParams.get("sort") as TPostSort | null;
  const sort = SORTS.some((s) => s.value === sortParam)
    ? (sortParam as TPostSort)
    : "latest";
  const { push } = useRouter();

  useEffect(() => {
    if (!query && !tag) push("/");
  }, [query, tag, push]);

  const sortHref = (value: TPostSort) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "latest") params.delete("sort");
    else params.set("sort", value);
    return `/search?${params.toString()}`;
  };

  if (!query && !tag) return null;

  return (
    <div className="flex flex-col gap-5 px-5 sm:px-8 py-10 max-w-3xl w-full mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <h1 className="font-serif text-2xl font-semibold break-all">
          {tag ? `#${tag}` : <>Results for &ldquo;{query}&rdquo;</>}
        </h1>
        <nav
          aria-label="Sort stories"
          className="bg-muted text-muted-foreground inline-flex h-9 items-center rounded-lg p-[3px]"
        >
          {SORTS.map(({ value, label }) => (
            <Link
              key={value}
              href={sortHref(value)}
              replace
              scroll={false}
              aria-current={sort === value ? "page" : undefined}
              className={cn(
                "inline-flex h-full items-center rounded-md px-2.5 text-sm font-medium transition-colors hover:text-foreground",
                sort === value && "bg-background text-foreground shadow-sm",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <PostFeed
        queryKey={["search", { query, tag, sort }]}
        fetchPage={(params) =>
          getAllPosts({ ...params, search: query, tag, sort })
        }
        empty={
          tag ? "No stories with this tag yet." : "No stories match that search."
        }
      />
    </div>
  );
};

export default Search;
