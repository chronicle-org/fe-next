"use client";

import { TPost } from "@/lib/api/post";
import Image from "next/image";
import { CommentIcon, DeleteIcon, PlaceholderImageIcon } from "../Icons";
import dayjs from "dayjs";
import { useMemo } from "react";
import HTMLReactParser from "html-react-parser/lib/index";
import "quill/dist/quill.bubble.css";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

const PostCard = ({
  data,
  onClick,
  onDelete,
}: {
  data: Partial<TPost>;
  onClick?: () => void;
  onDelete?: () => void;
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

  return (
    <div
      className={cn(
        "rounded-lg flex flex-col border border-border text-sm overflow-hidden",
        "shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="relative w-full h-24 md:hidden">
        {data.thumbnail_url ? (
          <Image
            src={data.thumbnail_url}
            alt={data.id?.toString() || ""}
            fill
            objectFit="cover"
          />
        ) : (
          <div className="flex justify-center items-center w-full h-full">
            <PlaceholderImageIcon className="h-full w-full aspect-square" />
          </div>
        )}
        {onDelete && (
          <Button
            className="absolute top-2 right-2 p-1! h-fit"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            variant={"destructive"}
          >
            <DeleteIcon color="white" />
          </Button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1">
        <div className="flex gap-10">
          <div className="w-full ql-bubble">
            <div
              className="line-clamp-2 w-fit! h-fit! p-0! ql-editor overflow-hidden!"
              onClick={(e) => e.stopPropagation()}
            >
              {HTMLReactParser(data.title || "")}
            </div>
            <div
              className="line-clamp-2 w-fit! h-fit! p-0! ql-editor overflow-hidden!"
              onClick={(e) => e.stopPropagation()}
            >
              {HTMLReactParser(data.sub_title || "")}
            </div>
            <div
              className="max-md:hidden line-clamp-2 w-fit! h-fit! overflow-hidden! p-0! mt-5 ql-editor"
              onClick={(e) => e.stopPropagation()}
            >
              {HTMLReactParser(data.content || "")}
            </div>
          </div>

          <div className="relative aspect-square h-40 max-md:hidden">
            {data.thumbnail_url ? (
              <Image
                src={data.thumbnail_url}
                alt={data.id?.toString() || ""}
                fill
                className="object-cover rounded-2xl"
              />
            ) : (
              <div className="flex justify-center items-center w-full h-full">
                <PlaceholderImageIcon className="h-full w-full aspect-square" />
              </div>
            )}
            {onDelete && (
              <Button
                className="absolute top-2 right-2 p-1! h-fit"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                variant={"destructive"}
              >
                <DeleteIcon color="white" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-end text-xs text-muted-foreground">
          {postCreateRelativeTime}
        </p>

        <div className="flex gap-5 items-center">
          <div className="w-full flex gap-2 items-center">
            <div className="relative w-[30px] h-[30px]">
              <Image
                src={data.user?.picture_url || ""}
                alt={data.user?.name || ""}
                fill
                className="rounded-full"
              />
            </div>

            <div className="flex flex-col">
              <div className="font-semibold">{data.user?.name}</div>
              <div className="text-xs text-muted-foreground">
                @{data.user?.handle}
              </div>
            </div>
          </div>

          <div className="flex gap-1 items-center">
            <CommentIcon color="#737373" />
            <div>{data.comment_count}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
