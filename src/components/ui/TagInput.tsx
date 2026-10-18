"use client";

import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MAX_TAG_LENGTH,
  MAX_TAGS,
  normalizeTag,
  parseTags,
  serializeTags,
} from "@/lib/tags";

export const TagInput = ({
  value,
  onChange,
  className,
}: {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}) => {
  const [draft, setDraft] = useState("");
  const tags = parseTags(value);
  const isFull = tags.length >= MAX_TAGS;

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    setDraft("");
    if (!tag || tags.includes(tag) || isFull) return;
    onChange(serializeTags([...tags, tag]));
  };

  const removeTag = (tag: string) =>
    onChange(serializeTags(tags.filter((t) => t !== tag)));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      // Enter would otherwise submit the post form.
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        className,
      )}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove tag ${tag}`}
            className="cursor-pointer hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft && addTag(draft)}
        disabled={isFull}
        maxLength={MAX_TAG_LENGTH}
        placeholder={
          isFull
            ? `Up to ${MAX_TAGS} tags`
            : tags.length
              ? "Add another tag"
              : "Add tags (press Enter after each)"
        }
        aria-label="Add a tag"
        className="min-w-[140px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  );
};
