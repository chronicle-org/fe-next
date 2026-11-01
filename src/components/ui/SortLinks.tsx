"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TPostSort } from "@/lib/api/post";
import { cn } from "@/lib/utils";

export const SORTS: { value: TPostSort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "likes", label: "Most liked" },
  { value: "views", label: "Most viewed" },
];

export const parseSort = (value?: string | null): TPostSort =>
  SORTS.some((s) => s.value === value) ? (value as TPostSort) : "latest";

/** Latest / Most liked / Most viewed as links that set ?sort= on `path`. */
export const SortLinks = ({
  path,
  sort,
}: {
  path: string;
  sort: TPostSort;
}) => {
  const searchParams = useSearchParams();
  const hrefFor = (value: TPostSort) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "latest") params.delete("sort");
    else params.set("sort", value);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  };

  return (
    <nav
      aria-label="Sort stories"
      className="bg-muted text-muted-foreground inline-flex h-9 items-center rounded-lg p-[3px]"
    >
      {SORTS.map(({ value, label }) => (
        <Link
          key={value}
          href={hrefFor(value)}
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
  );
};
