// Shared pieces for the generated share images (Open Graph cards).
// Satori, which draws them, only understands hex/rgb colours, flexbox and
// PNG/JPEG images, so this file avoids the site's oklch theme tokens.

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  ink: "#151821",
  inkSoft: "#1f2330",
  paper: "#f6f2ea",
  muted: "#a3a8b5",
  amber: "#e9a23b",
};

const LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M71 35 L51 16 L28 38 L28 62 L51 84 L71 65" fill="none" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="50" r="7" fill="#E9A23B"/></svg>';

export const LOGO_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString("base64")}`;

/**
 * Loads a Google font, cut down to the characters in `text` when given.
 * Returns null if
 * Google Fonts can't be reached; the card then uses the default font
 * instead of failing.
 */
async function loadGoogleFont(
  family: string,
  weight: number,
  text?: string,
): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}${text ? `&text=${encodeURIComponent(text)}` : ""}`,
      { signal: AbortSignal.timeout(3000), next: { revalidate: 86400 } },
    ).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 86400 },
    });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

type TFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600;
  style: "normal";
};

/**
 * The site's fonts for a card: Newsreader, cut down to `serifText`, and the
 * whole of Geist (about 70 KB) for everything else. Only `serifText` may use
 * the serif. Passing fonts replaces the renderer's built-in one; if both
 * fail to load, the card falls back to that default rather than breaking.
 */
export async function loadOgFonts(serifText: string) {
  const [serif, sans] = await Promise.all([
    loadGoogleFont("Newsreader", 600, serifText),
    loadGoogleFont("Geist", 400),
  ]);
  const fonts: TFont[] = [];
  if (serif) fonts.push({ name: "Newsreader", data: serif, weight: 600, style: "normal" });
  if (sans) fonts.push({ name: "Geist", data: sans, weight: 400, style: "normal" });
  return {
    fonts: fonts.length ? fonts : undefined,
    serif: serif ? "Newsreader" : "Geist",
    sans: "Geist",
  };
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/**
 * Fetches an image as a data URL when it's a PNG or JPEG the renderer can
 * draw. Anything else (WebP, too large, unreachable) comes back null, so a
 * bad thumbnail drops out of the card rather than breaking it.
 */
export async function loadImage(url?: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type")?.split(";")[0].trim();
    if (type !== "image/png" && type !== "image/jpeg") return null;
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_BYTES) return null;
    return `data:${type};base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return null;
  }
}

export const truncate = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

export const Wordmark = ({ fontFamily }: { fontFamily: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={LOGO_DATA_URL} width={44} height={44} alt="" />
    <span
      style={{
        fontFamily,
        fontSize: 32,
        fontWeight: 600,
        color: OG_COLORS.paper,
        letterSpacing: -0.5,
      }}
    >
      Chronicle
    </span>
  </div>
);
