"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { addPost, editPost, TAddPostPayload } from "../api/post";

export type TDraftFields = {
  title?: string;
  sub_title?: string;
  content?: string;
  tags?: string;
};

export type TAutosaveStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved"; at: Date; where: "server" | "device" }
  | { state: "error" };

type TLocalCopy = TDraftFields & { saved_at: string };

const LOCAL_DELAY_MS = 500;
const SERVER_DELAY_MS = 3000;

const storageKey = (userId: number, postId?: number) =>
  `chronicle:draft:${userId}:${postId ?? "new"}`;

const pickFields = (fields: TDraftFields): TDraftFields => ({
  title: fields.title ?? "",
  sub_title: fields.sub_title ?? "",
  content: fields.content ?? "",
  tags: fields.tags ?? "",
});

const textOf = (html?: string) =>
  (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** True when nothing worth saving has been written yet. */
export const isBlankDraft = (fields: TDraftFields) =>
  !textOf(fields.title) &&
  !textOf(fields.sub_title) &&
  !textOf(fields.content) &&
  !/<(img|iframe)/i.test(fields.content ?? "");

/**
 * Compares what a reader would see, so markup the editor rewrites on load
 * (attribute order, empty paragraphs) doesn't count as a change.
 */
export const sameDraft = (a: TDraftFields, b: TDraftFields) =>
  textOf(a.title) === textOf(b.title) &&
  textOf(a.sub_title) === textOf(b.sub_title) &&
  textOf(a.content) === textOf(b.content) &&
  (a.content ?? "").split(/<(?:img|iframe)/i).length ===
    (b.content ?? "").split(/<(?:img|iframe)/i).length &&
  (a.tags ?? "") === (b.tags ?? "");

export const readLocalCopy = (
  userId: number,
  postId?: number,
): TLocalCopy | null => {
  try {
    const raw = localStorage.getItem(storageKey(userId, postId));
    return raw ? (JSON.parse(raw) as TLocalCopy) : null;
  } catch {
    return null;
  }
};

const writeLocalCopy = (
  userId: number,
  postId: number | undefined,
  fields: TDraftFields,
) => {
  try {
    const copy: TLocalCopy = { ...fields, saved_at: new Date().toISOString() };
    localStorage.setItem(storageKey(userId, postId), JSON.stringify(copy));
    return true;
  } catch {
    return false;
  }
};

export const clearLocalCopy = (userId: number, postId?: number) => {
  try {
    localStorage.removeItem(storageKey(userId, postId));
  } catch {
    // Storage can be unavailable (private mode); nothing to clear then.
  }
};

/**
 * Keeps a post being written safe while the writer types.
 *
 * Every change is copied to this browser right away. Drafts, including new
 * posts, are also saved to the server as a draft a few seconds after typing
 * stops, so they survive a lost tab or a different device. Published posts
 * are only copied locally: saving them to the server would publish
 * half-finished edits.
 */
export function useDraftAutosave({
  enabled,
  userId,
  postId,
  syncToServer,
  fields,
}: {
  enabled: boolean;
  userId?: number;
  /** The post's id when editing an existing post. */
  postId?: number;
  syncToServer: boolean;
  fields: TDraftFields;
}) {
  const [status, setStatus] = useState<TAutosaveStatus>({ state: "idle" });
  // Id of a new post once the first autosave has created it.
  const [createdId, setCreatedId] = useState<number>();
  const idRef = useRef<number | undefined>(postId);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const stopped = useRef(false);
  const latest = useRef(pickFields(fields));
  const lastSaved = useRef(JSON.stringify(pickFields(fields)));
  const localTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const serverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const snapshot = JSON.stringify(pickFields(fields));

  const saveToServer = useCallback(
    (draft: TDraftFields) => {
      queue.current = queue.current.then(async () => {
        if (stopped.current) return;
        setStatus({ state: "saving" });
        try {
          const payload = { ...draft, is_draft: true };
          if (idRef.current) {
            await editPost(idRef.current, payload);
          } else {
            const res = await addPost(payload as TAddPostPayload);
            idRef.current = res.data.content?.id;
            setCreatedId(idRef.current);
            // Later copies are kept under the new id instead.
            if (userId) clearLocalCopy(userId);
          }
          lastSaved.current = JSON.stringify(draft);
          // The server copy is current, so the local one isn't needed.
          if (userId && JSON.stringify(latest.current) === lastSaved.current)
            clearLocalCopy(userId, idRef.current);
          setStatus({ state: "saved", at: new Date(), where: "server" });
        } catch {
          setStatus({ state: "error" });
        }
      });
    },
    [userId],
  );

  useEffect(() => {
    latest.current = JSON.parse(snapshot) as TDraftFields;
    clearTimeout(localTimer.current);
    clearTimeout(serverTimer.current);
    if (!enabled || !userId || stopped.current) return;
    if (snapshot === lastSaved.current) return;
    const draft = latest.current;

    localTimer.current = setTimeout(() => {
      const kept = writeLocalCopy(userId, idRef.current, draft);
      if (!syncToServer && kept)
        setStatus({ state: "saved", at: new Date(), where: "device" });
    }, LOCAL_DELAY_MS);

    if (syncToServer && !isBlankDraft(draft)) {
      serverTimer.current = setTimeout(
        () => saveToServer(draft),
        SERVER_DELAY_MS,
      );
    }
  }, [snapshot, enabled, userId, syncToServer, saveToServer]);

  // Write the latest text locally if the tab closes before the timer fires.
  useEffect(() => {
    if (!enabled || !userId) return;
    const keep = () => {
      if (stopped.current) return;
      if (JSON.stringify(latest.current) !== lastSaved.current)
        writeLocalCopy(userId, idRef.current, latest.current);
    };
    window.addEventListener("beforeunload", keep);
    return () => {
      window.removeEventListener("beforeunload", keep);
      clearTimeout(localTimer.current);
      clearTimeout(serverTimer.current);
      keep();
    };
  }, [enabled, userId]);

  /**
   * Cancels a pending autosave and waits for one in flight, so the caller
   * can submit without racing it. Resolves to the post's id, if it has one.
   */
  const flush = useCallback(async () => {
    clearTimeout(serverTimer.current);
    await queue.current;
    return idRef.current;
  }, []);

  /** Stops autosaving and forgets the local copy, after a real save. */
  const finish = useCallback(() => {
    stopped.current = true;
    clearTimeout(localTimer.current);
    clearTimeout(serverTimer.current);
    if (!userId) return;
    clearLocalCopy(userId, idRef.current);
    if (!postId) clearLocalCopy(userId);
  }, [userId, postId]);

  return { status, createdId, flush, finish };
}
