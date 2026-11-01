"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { getApiErrorMessage, TApiErrorResponse } from "@/lib/api";
import { getMyStats, TPostStats } from "@/lib/api/post";
import { cn } from "@/lib/utils";

// Titles are stored as editor HTML.
const plainTitle = (html: string) => html.replace(/<[^>]*>/g, "").trim();

const COLUMNS: { key: keyof TPostStats; label: string }[] = [
  { key: "view_count", label: "Views" },
  { key: "likes_count", label: "Likes" },
  { key: "likes_last_30_days", label: "Likes, 30 days" },
  { key: "comment_count", label: "Comments" },
  { key: "bookmarks_count", label: "Bookmarks" },
];

const Stats = () => {
  const [sortBy, setSortBy] = useState<keyof TPostStats>("view_count");
  const { data, isLoading, error } = useQuery({
    queryKey: ["stats", "mine"],
    queryFn: async () => (await getMyStats()).data.content ?? null,
  });

  const posts = useMemo(
    () =>
      [...(data?.posts ?? [])].sort(
        (a, b) => (b[sortBy] as number) - (a[sortBy] as number),
      ),
    [data, sortBy],
  );

  if (error)
    return (
      <ErrorState
        title="Stats aren't available"
        description={getApiErrorMessage(error as TApiErrorResponse)}
      />
    );

  const totals = data?.totals;
  const tiles = totals
    ? [
        { label: "Stories", value: totals.posts },
        { label: "Views", value: totals.views },
        { label: "Likes", value: totals.likes },
        { label: "Likes in the last 30 days", value: totals.likes_last_30_days },
        { label: "Comments", value: totals.comments },
        { label: "Followers", value: totals.followers },
      ]
    : [];

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-serif text-3xl font-semibold">Your stats</h1>

      <section
        aria-label="Totals"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          : tiles.map((tile) => (
              <div
                key={tile.label}
                className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1"
              >
                <span className="text-xs text-muted-foreground">
                  {tile.label}
                </span>
                <span className="text-2xl font-semibold tabular-nums">
                  {tile.value.toLocaleString()}
                </span>
              </div>
            ))}
      </section>

      <section aria-labelledby="per-story" className="flex flex-col gap-3">
        <h2 id="per-story" className="font-serif text-xl font-semibold">
          By story
        </h2>
        {isLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : !posts.length ? (
          <p className="text-muted-foreground">
            Publish a story and its numbers will show up here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th scope="col" className="text-left font-medium p-3">
                    Story
                  </th>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={sortBy === column.key ? "descending" : "none"}
                      className="text-right font-medium p-3 whitespace-nowrap"
                    >
                      <button
                        type="button"
                        className={cn(
                          "cursor-pointer hover:text-foreground",
                          sortBy === column.key && "text-foreground",
                        )}
                        onClick={() => setSortBy(column.key)}
                      >
                        {column.label}
                        {sortBy === column.key && " ↓"}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="p-3 max-w-[280px]">
                      <Link
                        href={`/post/${post.id}`}
                        className="line-clamp-2 hover:underline"
                      >
                        {plainTitle(post.title) || "Untitled"}
                      </Link>
                    </td>
                    {COLUMNS.map((column) => (
                      <td
                        key={column.key}
                        className="p-3 text-right tabular-nums"
                      >
                        {(post[column.key] as number).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Stats;
