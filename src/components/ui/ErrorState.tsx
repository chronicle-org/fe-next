import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "./Button";

/** Full-page message for missing pages and errors, in the site's style. */
export const ErrorState = ({
  code,
  title,
  description,
  actions,
}: {
  code?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) => {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        {code && (
          <span className="font-serif text-7xl font-semibold leading-none text-brand">
            {code}
          </span>
        )}
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {actions ?? (
            <>
              <Button asChild variant="brand">
                <Link href="/dashboard">Read the latest stories</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Go home</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export const PostNotFound = () => (
  <ErrorState
    code="404"
    title="This story isn't here"
    description="It may have been deleted, or it's a draft only its writer can see."
  />
);
