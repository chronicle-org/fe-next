"use client";

import { TPost } from "@/lib/api/post";
import Image from "next/image";
import { DeleteIcon } from "../Icons";
import dayjs from "dayjs";
import { useMemo } from "react";
import HTMLReactParser from "html-react-parser/lib/index";
import "quill/dist/quill.bubble.css";
import { cn, calculateReadingTime } from "@/lib/utils";
import { Button } from "./Button";
import { Bookmark, Heart, ImageIcon, MessageCircle, UserIcon } from "lucide-react";
import Link from "next/link";
import { TagList } from "./TagList";

// Remove anchor tags from HTML to prevent nested <a> tags (hydration error)
const sanitizeHtmlContent = (html: string): string => {
  return html.replace(/<a[^>]*>(.*?)<\/a>/gi, "$1");
};

const PostCard = ({
  data,
  onClick,
  onDelete,
  featured,
}: {
  data: Partial<TPost>;
  onClick?: () => void;
  onDelete?: () => void;
  featured?: boolean;
}) => {
  const postCreateRelativeTime = useMemo(() => {
    const createdDate = dayjs(data.created_at);
    const currentDate = dayjs();

    const minutes = currentDate.diff(createdDate, "minutes");
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }, [data.created_at]);

  const readingTime = useMemo(() => {
    return data.reading_time || (data.content ? calculateReadingTime(data.content) : 0);
  }, [data.reading_time, data.content]);

  const deleteButton = onDelete && (
    <Button
      className="absolute top-2 right-2 p-1! h-fit"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      variant={"destructive"}
      aria-label="Delete post"
    >
      <DeleteIcon color="white" />
    </Button>
  );

  const thumbnail = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-brand-soft",
        featured
          ? "w-full aspect-[16/9] md:w-64 md:aspect-[4/3]"
          : "w-full h-32 sm:w-28 sm:h-28",
      )}
    >
      {data.thumbnail_url ? (
        <Image
          src={data.thumbnail_url}
          alt=""
          fill
          sizes={featured ? "(min-width: 768px) 256px, 100vw" : "112px"}
          className="object-cover"
        />
      ) : (
        <div className="flex justify-center items-center w-full h-full text-brand">
          <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
        </div>
      )}
      {deleteButton}
    </div>
  );

  const layout = (
    <article
      className={cn(
        "group h-full rounded-xl border border-border bg-card text-card-foreground text-sm cursor-pointer",
        "flex gap-5 p-5 transition-colors hover:border-brand/60",
        featured
          ? "flex-col-reverse md:flex-row md:items-center md:p-6"
          : "flex-col-reverse sm:flex-row",
      )}
      onClick={onClick}
    >
      <div className="flex flex-1 min-w-0 flex-col gap-2">
        {featured && (
          <span className="text-xs font-semibold uppercase tracking-widest text-brand">
            Latest story
          </span>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="relative w-5 h-5 shrink-0">
            {!data.user?.picture_url ? (
              <UserIcon width={20} height={20} />
            ) : (
              <Image
                src={data.user?.picture_url || ""}
                alt=""
                fill
                sizes="20px"
                className="rounded-full object-cover"
              />
            )}
          </div>
          <span className="font-medium text-foreground truncate">
            {data.user?.name}
          </span>
          <span className="shrink-0">· {postCreateRelativeTime}</span>
        </div>

        <div className="w-full ql-bubble story-title">
          <div
            className={cn(
              "line-clamp-2 w-fit! h-fit! p-0! ql-editor overflow-hidden! leading-tight!",
              featured ? "text-2xl! md:text-3xl!" : "text-xl!",
              "group-hover:text-foreground/80",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {HTMLReactParser(sanitizeHtmlContent(data.title || ""))}
          </div>
        </div>
        <div className="w-full ql-bubble">
          <div
            className={cn(
              "w-fit! h-fit! p-0! ql-editor overflow-hidden! text-muted-foreground",
              featured ? "line-clamp-3 text-base!" : "line-clamp-2",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {HTMLReactParser(sanitizeHtmlContent(data.sub_title || ""))}
          </div>
        </div>

        <TagList tags={data.tags} limit={3} className="mt-1" />

        <div className="mt-auto pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {readingTime ? <span>{readingTime} min read</span> : null}
          <span className="flex gap-1 items-center">
            <Heart className="w-3.5 h-3.5" />
            {data.likes_count ?? 0}
          </span>
          <span className="flex gap-1 items-center">
            <Bookmark className="w-3.5 h-3.5" />
            {data.bookmarks_count ?? 0}
          </span>
          <span className="flex gap-1 items-center">
            <MessageCircle className="w-3.5 h-3.5" />
            {data.comment_count ?? 0}
          </span>
        </div>
      </div>

      {/* Posts without a thumbnail stay text-only, unless the delete button needs a home */}
      {(data.thumbnail_url || onDelete) && thumbnail}
    </article>
  );

  if (onDelete) {
    return layout;
  }
  else {
    return (
      <Link
        href={`/post/${data.id}`}
        className="w-full block rounded-xl focus-visible:outline-2 focus-visible:outline-brand"
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || !!onDelete) {
            return;
          }
        }}
      >{layout}</Link>
    );
  }
};

export default PostCard;
