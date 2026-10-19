import type { Metadata } from "next";
import SignUp from "./SignUp";
import { AuthShell } from "../AuthShell";

export const metadata: Metadata = { title: "Sign up | Chronicle" };

export default function Register() {
  return (
    <AuthShell>
      <SignUp />
    </AuthShell>
  );
}
