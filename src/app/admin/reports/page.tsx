import type { Metadata } from "next";
import Reports from "./Reports";

export const metadata: Metadata = {
  title: "Reports | Chronicle",
  robots: { index: false },
};

export default function ReportsPage() {
  return <Reports />;
}
