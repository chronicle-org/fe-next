import type { Metadata } from "next";
import Stats from "./Stats";

export const metadata: Metadata = {
  title: "Your stats | Chronicle",
  robots: { index: false },
};

export default function StatsPage() {
  return <Stats />;
}
