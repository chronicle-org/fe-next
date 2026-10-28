import { ImageResponse } from "next/og";
import { excerpt, getPublicPost, stripHtml } from "@/lib/server/post";
import { parseTags } from "@/lib/tags";
import {
  loadImage,
  loadOgFonts,
  OG_COLORS,
  OG_SIZE,
  truncate,
  Wordmark,
} from "@/lib/server/og";

export const alt = "A story on Chronicle";
export const size = OG_SIZE;
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

/** The preview card shown when a post is shared on WhatsApp, X, LinkedIn and so on. */
export default async function Image({ params }: Props) {
  const { id } = await params;
  const post = /^\d+$/.test(id) ? await getPublicPost(Number(id)) : null;

  const title = truncate(
    (post && stripHtml(post.title)) || "A story on Chronicle",
    110,
  );
  const subtitle = post ? excerpt(post.sub_title || post.content, 140) : "";
  const author = post?.user?.name ?? "";
  const handle = post?.user?.handle ?? "";
  const tags = post ? parseTags(post.tags).slice(0, 3) : [];
  const readingTime = post?.reading_time ?? 0;

  const readingLabel = readingTime > 0 ? `${readingTime} min read` : "";
  const [fonts, thumbnail, avatar] = await Promise.all([
    loadOgFonts(`Chronicle${title}`),
    loadImage(post?.thumbnail_url),
    loadImage(post?.user?.picture_url),
  ]);
  const serifFamily = fonts.serif;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: OG_COLORS.ink,
          color: OG_COLORS.paper,
          fontFamily: fonts.sans,
        }}
      >
        <div style={{ width: 14, height: "100%", background: OG_COLORS.amber }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
          }}
        >
          <Wordmark fontFamily={serifFamily} />

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                fontFamily: serifFamily,
                fontSize: thumbnail
                  ? title.length > 60 ? 50 : 60
                  : title.length > 60 ? 58 : 72,
                fontWeight: 600,
                lineHeight: 1.12,
                letterSpacing: -1,
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 28, lineHeight: 1.4, color: OG_COLORS.muted }}>
                {subtitle}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {avatar && (
               
              <img
                src={avatar}
                width={56}
                height={56}
                alt=""
                style={{ borderRadius: 28, objectFit: "cover" }}
              />
            )}
            {author && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 26, color: OG_COLORS.paper }}>{author}</span>
                {handle && (
                  <span style={{ fontSize: 22, color: OG_COLORS.muted }}>@{handle}</span>
                )}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
              {readingLabel && (
                <span style={{ fontSize: 22, color: OG_COLORS.amber, padding: "6px 0" }}>
                  {readingLabel}
                </span>
              )}
              {!thumbnail &&
                tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 20,
                      padding: "6px 14px",
                      borderRadius: 999,
                      background: OG_COLORS.inkSoft,
                      color: OG_COLORS.muted,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          </div>
        </div>
        {thumbnail && (
          <div style={{ display: "flex", padding: "56px 56px 56px 0" }}>
            { }
            <img
              src={thumbnail}
              width={380}
              height={518}
              alt=""
              style={{ borderRadius: 24, objectFit: "cover" }}
            />
          </div>
        )}
      </div>
    ),
    { ...size, fonts: fonts.fonts },
  );
}
