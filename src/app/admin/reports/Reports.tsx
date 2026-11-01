"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadMore } from "@/components/ui/LoadMore";
import { Spinner } from "@/components/ui/spinner";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import {
  getReportAccess,
  getReports,
  REPORT_REASONS,
  resolveReport,
  TReport,
  TReportStatus,
} from "@/lib/api/report";
import { useLoadMoreQuery } from "@/lib/hooks/useLoadMoreQuery";
import { cn } from "@/lib/utils";

const TABS: { value: TReportStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "dismissed", label: "Dismissed" },
];

const plain = (html: string) => html.replace(/<[^>]*>/g, "").trim();

const Reports = () => {
  const [status, setStatus] = useState<TReportStatus>("open");
  const { data: access, isLoading: checking } = useQuery({
    queryKey: ["reports", "access"],
    queryFn: async () => {
      try {
        return (await getReportAccess()).data.content?.is_admin ?? false;
      } catch {
        return false;
      }
    },
  });

  const {
    items,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useLoadMoreQuery({
    queryKey: ["reports", status],
    fetchPage: (params) => getReports(status, params),
    enabled: !!access,
  });

  const { mutate: resolve, isPending, variables } = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "removed" | "dismissed" }) =>
      resolveReport(id, action),
    onSuccess: (_, { action }) => {
      toast.success(action === "removed" ? "Removed" : "Report dismissed");
      refetch();
    },
    onError: (error: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  if (checking)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  if (!access)
    return (
      <ErrorState
        code="403"
        title="Only admins can see this"
        description="Reports are reviewed by the people listed as admins on the server."
      />
    );

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <h1 className="font-serif text-3xl font-semibold">Reports</h1>
        <nav
          aria-label="Report status"
          className="bg-muted text-muted-foreground inline-flex h-9 items-center rounded-lg p-[3px]"
        >
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={status === tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                "h-full rounded-md px-3 text-sm font-medium cursor-pointer hover:text-foreground",
                status === tab.value && "bg-background text-foreground shadow-sm",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !items.length ? (
        <p className="text-muted-foreground py-10 text-center">
          {status === "open" ? "Nothing to review." : "No dismissed reports."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              busy={isPending && variables?.id === report.id}
              onResolve={
                status === "open"
                  ? (action) => resolve({ id: report.id, action })
                  : undefined
              }
            />
          ))}
        </ul>
      )}
      <LoadMore
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        onClick={() => fetchNextPage()}
      />
    </div>
  );
};

const ReportCard = ({
  report,
  busy,
  onResolve,
}: {
  report: TReport;
  busy: boolean;
  onResolve?: (action: "removed" | "dismissed") => void;
}) => {
  const author = report.post?.user ?? report.comment?.user;
  const what = report.post_id ? "Story" : "Comment";
  const link = report.post_id
    ? `/post/${report.post_id}`
    : `/post/${report.comment?.post_id}`;
  const text = report.post
    ? plain(report.post.title) || "Untitled"
    : report.comment?.content ?? "";

  return (
    <li className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 font-medium">
          {REPORT_REASONS[report.reason] ?? report.reason}
        </span>
        <span>
          {what} by{" "}
          {author ? (
            <Link href={`/profile/${author.id}`} className="underline">
              {author.name}
            </Link>
          ) : (
            "someone"
          )}
        </span>
        <span>
          · reported by{" "}
          <Link href={`/profile/${report.reporter.id}`} className="underline">
            {report.reporter.name}
          </Link>{" "}
          {dayjs(report.created_at).format("D MMM YYYY")}
        </span>
      </div>
      <Link
        href={link}
        className="whitespace-pre-wrap break-words line-clamp-4 hover:underline"
      >
        {text}
      </Link>
      {report.details && (
        <p className="text-muted-foreground border-l-2 border-border pl-3">
          {report.details}
        </p>
      )}
      {onResolve && (
        <div className="flex gap-2 self-end">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => onResolve("dismissed")}
          >
            Keep it
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={busy}
            onClick={() => onResolve("removed")}
          >
            Remove {what.toLowerCase()}
          </Button>
        </div>
      )}
    </li>
  );
};

export default Reports;
