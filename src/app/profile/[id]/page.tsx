import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Profile from "./Profile";
import { localCookieName } from "@/lib/utils";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(localCookieName);

  const param = await params;
  if (isNaN(Number(param.id))) notFound();

  const currentUser = userCookie ? JSON.parse(userCookie.value) : null;

  if (currentUser && Number(currentUser.id) === Number(param.id)) {
    redirect("/profile");
  }

  return <Profile userId={Number(param.id)} />;
}
