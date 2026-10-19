import type { Metadata } from "next";
import SignIn from "./SignIn";
import { AuthShell } from "./AuthShell";

export const metadata: Metadata = { title: "Log in | Chronicle" };

export default function Auth() {
  return (
    <AuthShell>
      <SignIn />
    </AuthShell>
  );
}
