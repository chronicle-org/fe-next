"use client";

import { useEffect } from "react";
import "./globals.css";

// Replaces the root layout when it fails, so it brings its own <html> and
// <body> and avoids anything that needs the providers.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 font-sans antialiased">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Chronicle is having trouble
          </h1>
          <p className="text-muted-foreground">
            Something went wrong on our side. Please try again in a moment.
          </p>
          <div className="mt-2 flex gap-3">
            <button
              onClick={reset}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 cursor-pointer"
            >
              Try again
            </button>
            {/* A full reload, since client navigation may be what broke. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
