import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isSignupEnabled } from "@/lib/server/signup";
import SignUp from "./SignUp";
import { AuthShell } from "../AuthShell";

export const metadata: Metadata = { title: "Sign up | Chronicle" };

export default function Register() {
  if (!isSignupEnabled()) notFound();

  return (
    <AuthShell>
      <SignUp />
    </AuthShell>
  );
}
