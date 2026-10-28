import type { Metadata } from "next";
import { ErrorState } from "@/components/ui/ErrorState";

export const metadata: Metadata = {
  title: "Page not found | Chronicle",
};

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="This page wandered off"
      description="The link may be broken, or the page may have moved. The stories are still here, though."
    />
  );
}
