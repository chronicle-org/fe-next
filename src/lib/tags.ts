// Tags are stored by the API as one comma-separated string (max 255 chars).
export const MAX_TAGS = 5;
export const MAX_TAG_LENGTH = 30;
const MAX_TAGS_STRING_LENGTH = 255;

export const normalizeTag = (tag: string): string =>
  tag
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/[,\s]+/g, "-")
    .slice(0, MAX_TAG_LENGTH);

export const parseTags = (tags?: string | null): string[] =>
  (tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const serializeTags = (tags: string[]): string =>
  tags.join(",").slice(0, MAX_TAGS_STRING_LENGTH);
