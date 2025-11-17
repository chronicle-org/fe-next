"use client";
import dynamic from "next/dynamic";

const Navigation = dynamic(() => import("@/components/ui/Navigation"), {
  ssr: false,
});

export default function NoSSRNavigation() {
  return <Navigation />;
}