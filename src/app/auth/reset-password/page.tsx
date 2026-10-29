import type { Metadata } from "next";
import { AuthShell } from "../AuthShell";
import ResetPassword from "./ResetPassword";

export const metadata: Metadata = {
  title: "Choose a new password | Chronicle",
  // The link carries a one-time token; keep it out of search results.
  robots: { index: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell>
      <ResetPassword token={token ?? ""} />
    </AuthShell>
  );
}
