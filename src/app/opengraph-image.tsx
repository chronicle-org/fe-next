import { ImageResponse } from "next/og";
import { loadOgFonts, OG_COLORS, OG_SIZE, Wordmark } from "@/lib/server/og";

export const alt = "Chronicle: share your stories with the world";
export const size = OG_SIZE;
export const contentType = "image/png";

const HEADLINE = "Share your stories with the world.";
const TAGLINE = "Write, publish and follow the writers you like.";

/** The site-wide share card, used by pages without one of their own. */
export default async function Image() {
  const fonts = await loadOgFonts(`Chronicle${HEADLINE}`);
  const serifFamily = fonts.serif;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: OG_COLORS.ink,
          color: OG_COLORS.paper,
          fontFamily: fonts.sans,
          borderLeft: `14px solid ${OG_COLORS.amber}`,
        }}
      >
        <Wordmark fontFamily={serifFamily} />
        <div
          style={{
            fontFamily: serifFamily,
            fontSize: 84,
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: -1.5,
            maxWidth: 900,
          }}
        >
          {HEADLINE}
        </div>
        <div style={{ fontSize: 28, color: OG_COLORS.muted }}>
          {TAGLINE}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.fonts },
  );
}
