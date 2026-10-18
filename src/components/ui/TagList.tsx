import Link from "next/link";
import { cn } from "@/lib/utils";
import { parseTags } from "@/lib/tags";

const chipClassName =
  "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground";

// Linked chips open a search for the tag; leave `linked` off inside
// elements that are already links (like PostCard) to avoid nested <a>.
export const TagList = ({
  tags,
  linked,
  limit,
  className,
}: {
  tags?: string | null;
  linked?: boolean;
  limit?: number;
  className?: string;
}) => {
  const list = parseTags(tags).slice(0, limit);
  if (list.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Tags">
      {list.map((tag) => (
        <li key={tag}>
          {linked ? (
            <Link
              href={`/search?q=${encodeURIComponent(tag)}`}
              className={cn(chipClassName, "hover:text-foreground")}
            >
              #{tag}
            </Link>
          ) : (
            <span className={chipClassName}>#{tag}</span>
          )}
        </li>
      ))}
    </ul>
  );
};
