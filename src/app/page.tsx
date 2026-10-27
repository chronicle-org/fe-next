"use client";

import PostCard from "@/components/ui/PostCard";
import { getAllPosts } from "@/lib/api/post";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/Button";
import { usePaginationQuery } from "@/lib/hooks/usePaginatedQuery";
import { parseTags } from "@/lib/tags";

export default function Home() {

  const {
    data: posts,
    isLoading,
    setFilters,
    pagination,
  } = usePaginationQuery({
    queryKey: (state) => ["posts", state],
    fetchFunction: async (params) => {
      const { filters, ...rest } = params;
      return getAllPosts({
        ...rest,
        search: filters.search,
      });
    },
    fetchOnce: true,
    initPage: 1,
    initFilters: {
      search: "",
    },
  });

  const isSearching = !!pagination.filters.search;
  const [featured, ...rest] = posts || [];

  // Most used tags across the loaded posts
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    posts?.forEach((post) =>
      parseTags(post.tags).forEach((tag) =>
        counts.set(tag, (counts.get(tag) || 0) + 1),
      ),
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [posts]);

  return (
    <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 flex flex-col gap-12 pt-10 pb-16">
      <Heading />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <main className="flex flex-col gap-5 min-w-0">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-3">
            <h2 className="font-serif text-2xl font-semibold">
              {isSearching ? "Search results" : "Fresh from the community"}
            </h2>
            <SearchBar
              debounce={500}
              onChange={(value) => {
                setFilters({ search: value });
              }}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : !posts?.length ? (
            <p className="text-muted-foreground py-10 text-center">
              {isSearching ? "No stories match that search." : "No stories yet."}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {featured && !isSearching && <PostCard data={featured} featured />}
              {(isSearching ? posts : rest).map((item) => (
                <PostCard data={item} key={item.id} />
              ))}
            </div>
          )}
        </main>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
          {topics.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Topics
              </h3>
              <ul className="flex flex-wrap gap-2">
                {topics.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs hover:bg-brand hover:text-brand-foreground transition-colors"
                    >
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="rounded-xl bg-ink text-white p-5 flex flex-col gap-3 dark:border dark:border-white/10">
            <h3 className="font-serif text-xl font-semibold leading-snug">
              Have a story to tell?
            </h3>
            <p className="text-sm text-white/70">
              Write it, tag it, and share it with readers who care.
            </p>
            <Button variant="brand" asChild className="w-fit">
              <Link href="/auth">Start writing</Link>
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}

const Heading = () => {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand">
          Chronicle
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight text-balance">
          Share your stories, connect with <em className="text-brand">minds</em>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Share your stories with the world. Start writing and inspire others
          today!
        </p>
        <div className="flex gap-3 pt-2">
          <Button variant="brand" size="lg" asChild>
            <Link href="/auth">Start writing</Link>
          </Button>
        </div>
      </div>

      <Image
        src={"/landing-page-side-image.png"}
        alt="Chronicle Hero"
        width={500}
        height={300}
        className="rounded-xl w-full h-auto max-lg:hidden"
        priority
      />
    </section>
  );
};
