import type { Metadata } from "next";
import SignIn from "./SignIn";
import { AuthShell } from "./AuthShell";
import { isSignupEnabled } from "@/lib/server/signup";

export const metadata: Metadata = { title: "Log in | Chronicle" };

export default function Auth() {
  return (
    <AuthShell>
      <SignIn signupEnabled={isSignupEnabled()} />
    </AuthShell>
  );
}
