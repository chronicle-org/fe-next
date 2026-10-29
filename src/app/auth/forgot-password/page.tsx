import type { Metadata } from "next";
import { AuthShell } from "../AuthShell";
import ForgotPassword from "./ForgotPassword";

export const metadata: Metadata = { title: "Forgot password | Chronicle" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPassword />
    </AuthShell>
  );
}
