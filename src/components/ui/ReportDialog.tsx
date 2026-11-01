"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import {
  createReport,
  REPORT_REASONS,
  TReportPayload,
  TReportReason,
} from "@/lib/api/report";
import { Modal } from "./Modal";
import { Textarea } from "./textarea";

/** Asks why a post or comment is being reported, then files the report. */
export const ReportDialog = ({
  isOpen,
  onClose,
  target,
}: {
  isOpen: boolean;
  onClose: () => void;
  target: { post_id: number } | { comment_id: number };
}) => {
  const [reason, setReason] = useState<TReportReason | null>(null);
  const [details, setDetails] = useState("");
  const what = "post_id" in target ? "post" : "comment";

  const close = () => {
    setReason(null);
    setDetails("");
    onClose();
  };

  const { mutate: send, isPending } = useMutation({
    mutationFn: () =>
      createReport({
        ...target,
        reason: reason!,
        details: details.trim() || undefined,
      } as TReportPayload),
    onSuccess: () => {
      toast.success("Thanks for reporting. We'll take a look.");
      close();
    },
    onError: (error: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={`Report this ${what}`}
      onConfirm={() => reason && send()}
      confirmText="Send report"
      isLoading={isPending || !reason}
      variant="destructive"
    >
      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="mb-2 text-muted-foreground">
          What&apos;s wrong with it?
        </legend>
        {(Object.keys(REPORT_REASONS) as TReportReason[]).map((key) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="report-reason"
              value={key}
              checked={reason === key}
              onChange={() => setReason(key)}
              className="accent-brand"
            />
            {REPORT_REASONS[key]}
          </label>
        ))}
        <Textarea
          aria-label="More details (optional)"
          placeholder="More details (optional)"
          maxLength={1000}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="mt-2"
        />
      </fieldset>
    </Modal>
  );
};
