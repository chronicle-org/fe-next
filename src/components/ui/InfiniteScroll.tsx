"use client";

import { useEffect, useRef } from "react";

type InfiniteScrollProps = {
  loadMore: () => void;
  hasMore: boolean;
};

export function InfiniteScroll({ loadMore, hasMore }: InfiniteScrollProps) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });

    const el = loaderRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loadMore]);

  return (
    <div ref={loaderRef} className="py-6 text-center">
      {hasMore ? "Loading more..." : "No more posts"}
    </div>
  );
}
