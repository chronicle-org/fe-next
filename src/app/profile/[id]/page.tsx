import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Profile from "./Profile";
import { localCookieName } from "@/lib/utils";
import { excerpt, siteUrl } from "@/lib/server/post";
import { getPublicProfile } from "@/lib/server/user";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = Number.isNaN(Number(id)) ? null : await getPublicProfile(Number(id));
  if (!user) return { title: "Chronicle" };

  const title = `${user.name} (@${user.handle})`;
  const description =
    excerpt(user.profile_description || "") ||
    `Read posts by ${user.name} on Chronicle.`;
  const images = user.picture_url ? [user.picture_url] : undefined;
  const url = siteUrl ? `${siteUrl}/profile/${user.id}` : undefined;

  return {
    title: `${title} | Chronicle`,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      type: "profile",
      title,
      description,
      url,
      images,
      username: user.handle,
      siteName: "Chronicle",
    },
    twitter: { card: "summary", title, description, images },
  };
}

export default async function Page({ params }: Props) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(localCookieName);

  const param = await params;
  if (isNaN(Number(param.id))) notFound();

  const currentUser = userCookie ? JSON.parse(userCookie.value) : null;

  if (currentUser && Number(currentUser.id) === Number(param.id)) {
    redirect("/profile");
  }

  const profile = await getPublicProfile(Number(param.id));

  return (
    <>
      {profile && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              mainEntity: {
                "@type": "Person",
                name: profile.name,
                alternateName: `@${profile.handle}`,
                description: profile.profile_description || undefined,
                image: profile.picture_url || undefined,
                url: siteUrl ? `${siteUrl}/profile/${profile.id}` : undefined,
              },
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <Profile userId={Number(param.id)} />
    </>
  );
}
