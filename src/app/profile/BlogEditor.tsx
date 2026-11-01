import {
  ChevronIcon,
  PasswordHideIcon,
  PasswordShowIcon,
} from "@/components/Icons";
import { Button } from "@/components/ui/Button";
import { CommentSection } from "@/components/ui/CommentSection";
import { Modal } from "@/components/ui/Modal";
import ImageUploader from "@/components/ui/UploadImage";
import { TApiErrorResponse, getApiErrorMessage } from "@/lib/api";
import { TLoginResponse } from "@/lib/api/auth";
import { deleteComment } from "@/lib/api/comment";
import { uploadFile } from "@/lib/api/file";
import {
  addPost,
  editPost,
  TAddPostPayload,
  TPost,
  updateCounter,
  updateInteraction,
} from "@/lib/api/post";
import {
  fileUploadKey,
  toolbarBaseOptions,
  toolbarContentOptions,
} from "@/lib/constants";
import { useUserStore } from "@/lib/stores/user.store";
import { InteractionType } from "@/lib/types";
import { updateCookie, calculateReadingTime } from "@/lib/utils";
import {
  clearLocalCopy,
  isBlankDraft,
  readLocalCopy,
  sameDraft,
  TDraftFields,
  useDraftAutosave,
} from "@/lib/hooks/useDraftAutosave";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import HTMLReactParser from "html-react-parser/lib/index";
import {
  Bookmark,
  Check,
  Copy,
  Eye,
  Heart,
  LinkIcon,
  Share2,
  UserIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "react-quill-new/dist/quill.bubble.css";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";
import { initPayloadData, SharePlatforms, TEditorTheme } from "./constants";
import { TagInput } from "@/components/ui/TagInput";
import { TagList } from "@/components/ui/TagList";
import { cn } from "@/lib/utils";

export const BlogEditor = ({
  data,
  isVisit,
  isPostView,
  onBack,
  onUpdatePostCounter,
}: {
  data?: Partial<TPost>;
  isVisit?: boolean;
  isPostView?: boolean;
  onBack?: () => void;
  onUpdatePostCounter?: (post: Partial<TPost>) => void;
}) => {
  const { push } = useRouter();
  const user = useUserStore((state) => state.user);
  const updateUserStore = useUserStore((state) => state.setUser);
  const [formData, setFormData] = useState<Partial<typeof initPayloadData>>(
    data || initPayloadData,
  );
  const [isDraft, setIsDraft] = useState<boolean>(data?.is_draft || false);
  const initRef = useRef(false);
  const [modalShare, setModalShare] = useState<{
    show: boolean;
    shareUrl?: string;
  }>({ show: false });
  const [copied, setCopied] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<TEditorTheme>("snow");
  const formRef = useRef<HTMLFormElement>(null);
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill-new"), { ssr: false }),
    [],
  );

  const isEditing = !isVisit && !!user;
  const [restorable, setRestorable] = useState<
    (TDraftFields & { saved_at: string }) | null
  >(null);

  // Offer back text this browser kept from an earlier visit that never
  // reached the server, such as edits to a published post or a closed tab.
  useEffect(() => {
    if (!isEditing || !user?.id) return;
    const copy = readLocalCopy(user.id, data?.id);
    if (!copy) return;
    if (isBlankDraft(copy) || sameDraft(copy, data ?? {})) {
      clearLocalCopy(user.id, data?.id);
      return;
    }
    setRestorable(copy);
    // Only on opening the editor; later changes are the writer's own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, user?.id, data?.id]);

  const autosave = useDraftAutosave({
    // Hold off while a kept copy is on offer, so it isn't overwritten.
    enabled: isEditing && !restorable,
    userId: user?.id,
    postId: data?.id,
    // Saving a published post to the server would publish unfinished edits.
    syncToServer: !data?.id || !!data?.is_draft,
    fields: formData,
  });

  const autosaveLabel = useMemo(() => {
    const { status } = autosave;
    if (status.state === "saving") return "Saving…";
    if (status.state === "error") return "Couldn't save, kept on this device";
    if (status.state === "saved")
      return status.where === "server"
        ? `Draft saved ${dayjs(status.at).format("HH:mm")}`
        : "Changes kept on this device";
    return null;
  }, [autosave]);

  const estimatedReadingTime = useMemo(() => {
    return formData.content ? calculateReadingTime(formData.content) : 0;
  }, [formData.content]);

  const { mutate: upload, isPending: isUploadingFile } = useMutation({
    mutationFn: (data: { file: File; type: keyof typeof fileUploadKey }) =>
      uploadFile(data.file, data.type),
  });

  const { mutate: submitPost, isPending: isSubmittingPost } = useMutation({
    mutationFn: (data: TAddPostPayload) => addPost(data),
    onSuccess: () => {
      autosave.finish();
      onBack?.();
    },
    onError: (err: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const { mutate: updatePost, isPending: isUpdatingPost } = useMutation({
    mutationFn: (payload: { id: number; data: Partial<TAddPostPayload> }) =>
      editPost(payload.id, payload.data),
    onSuccess: (_, payload) => {
      autosave.finish();
      const wasDraft = data?.is_draft || (!data?.id && !!autosave.createdId);
      if (wasDraft && payload.data.is_draft === false)
        toast.success("Draft published successfully!");
      onBack?.();
    },
    onError: (err: TApiErrorResponse) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const save = async (asDraft: boolean) => {
    // Let a running autosave finish first, so a new post isn't created twice.
    const savedId = await autosave.flush();
    const postId = data?.id ?? savedId;
    const newData = {
      title: formData.title,
      sub_title: formData.sub_title,
      content: formData.content,
      tags: formData.tags ?? "",
      is_draft: asDraft,
    };
    const send = (thumbnail_url?: string) => {
      const payload = thumbnail_url ? { ...newData, thumbnail_url } : newData;
      if (postId) updatePost({ id: postId, data: payload });
      else submitPost(payload as TAddPostPayload);
    };
    if (formData.thumbnail_file)
      upload(
        { file: formData.thumbnail_file, type: 1 },
        {
          onSuccess: (res) => send(res.data.content?.url),
          onError: (error) => {
            const err = error as TApiErrorResponse;
            toast.error(getApiErrorMessage(err));
          },
        },
      );
    else send();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void save(isDraft);
  };

  const handleChange = (key: keyof typeof formData, value?: string | File) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = useCallback(() => {
    const text = urlInputRef.current?.value ?? "";
    if (!text) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }, []);

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "-99999px";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const success = document.execCommand("copy");
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
    }

    document.body.removeChild(textArea);
  };

  const { mutate: countInteraction } = useMutation({
    mutationFn: async (interaction: InteractionType) => {
      const apiCallPromise = updateInteraction(interaction, data?.id ?? 0);

      if (interaction === "view" || interaction === "share")
        return apiCallPromise;
      else {
        toast.promise(apiCallPromise, {
          loading: "Processing...",
          success: () => {
            const text =
              interaction.charAt(0).toUpperCase() + interaction.slice(1);
            return `${text}${text[text.length - 1] === "e" ? "d" : "ed"}`;
          },
          error: (err) => getApiErrorMessage(err),
        });
        return apiCallPromise;
      }
    },
    onSuccess: (res, interaction) => {
      if (interaction === "view" || interaction === "share") return;
      updateUserStore(res.data.content?.user as TLoginResponse);
      updateCookie(JSON.stringify(res.data.content?.user));
      onUpdatePostCounter?.(res.data.content?.post as TPost);
    },
  });

  const { mutate: addCounter } = useMutation({
    mutationFn: async (actionType: "view" | "share") => {
      return updateCounter(actionType, data?.id ?? 0);
    },
  });

  useEffect(() => {
    if (!data?.id || initRef.current) return;
    // The API skips a writer's own views too; this saves the request.
    if (user && user.id === data.user_id) return;
    if (isVisit || isPostView) {
      initRef.current = true;
      addCounter("view");
    }
  }, [isVisit, isPostView, data?.id, data?.user_id, user, addCounter]);

  return (
    <>
      <Modal
        isOpen={modalShare.show}
        onClose={() => setModalShare({ show: false })}
      >
        <div className="flex flex-col gap-2">
          <div className="flex rounded-lg shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-muted-foreground text-sm">
              <LinkIcon className="w-4 h-4" />
            </span>
            <input
              id="share-link"
              disabled
              ref={urlInputRef}
              type="text"
              readOnly
              value={modalShare.shareUrl}
              className="flex-1 min-w-0 block w-full px-4 py-2 border border-input bg-background text-foreground text-sm focus:ring-ring focus:border-ring"
            />
            <button
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center px-4 py-2 rounded-r-lg text-sm font-medium transition duration-150 ease-in-out cursor-pointer",
                copied
                  ? "bg-green-500 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto">
            {SharePlatforms.map((platform) => {
              return (
                <div
                  className="rounded-full cursor-pointer bg-muted p-2"
                  key={platform.name}
                  onClick={() => {
                    addCounter("share");
                    const stringTitle =
                      data?.title?.replace(/<[^>]*>/g, "") || "";
                    window.open(
                      platform.getShareUrl(
                        modalShare.shareUrl || "",
                        stringTitle,
                      ),
                      "_blank",
                    );
                  }}
                >
                  <platform.icon
                    color="var(--muted-foreground)"
                    className="w-5 h-5"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
      <div className="flex flex-col gap-10 w-full">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-full flex-1 flex flex-col gap-10"
        >
          <div className="flex justify-between items-center">
            {onBack && (
              <div className="cursor-pointer" onClick={onBack}>
                <ChevronIcon color="var(--foreground)" /> Back
              </div>
            )}

            {!isVisit && (
              <div className="flex gap-5 self-end items-center">
                <div
                  className="w-fit h-fit cursor-pointer p-2"
                  onClick={() => setTheme(theme === "snow" ? "bubble" : "snow")}
                >
                  {theme === "snow" ? (
                    <PasswordShowIcon
                      width={20}
                      height={20}
                      color="var(--foreground)"
                    />
                  ) : (
                    <PasswordHideIcon
                      width={20}
                      height={20}
                      color="var(--foreground)"
                    />
                  )}
                </div>

                {autosaveLabel && (
                  <span
                    className="text-xs text-muted-foreground"
                    role="status"
                    aria-live="polite"
                  >
                    {autosaveLabel}
                  </span>
                )}

                {estimatedReadingTime > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {estimatedReadingTime} min read
                  </span>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDraft}
                    onChange={(e) => setIsDraft(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Save as Draft</span>
                </label>

                {data?.id && data.is_draft && (
                  <Button
                    variant={"default"}
                    type="button"
                    disabled={isUploadingFile || isUpdatingPost}
                    onClick={() => void save(false)}
                  >
                    Publish
                  </Button>
                )}

                <Button
                  variant={"secondary"}
                  type="submit"
                  disabled={
                    isUploadingFile || isSubmittingPost || isUpdatingPost
                  }
                >
                  {data?.id ? "Update" : "Submit"}
                </Button>
              </div>
            )}
          </div>

          {restorable && (
            <div
              role="alert"
              className="w-full max-w-[800px] mx-auto flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/40 bg-brand-soft px-4 py-3 text-sm"
            >
              <span>
                You have unsaved changes from{" "}
                {dayjs(restorable.saved_at).format("D MMM, HH:mm")}.
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (user) clearLocalCopy(user.id, data?.id);
                    setRestorable(null);
                  }}
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="brand"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      title: restorable.title,
                      sub_title: restorable.sub_title,
                      content: restorable.content,
                      tags: restorable.tags,
                    }));
                    setRestorable(null);
                  }}
                >
                  Restore
                </Button>
              </div>
            </div>
          )}

          <div className={cn("w-full flex flex-col gap-10 mx-auto", isVisit ? "max-w-[720px]" : "max-w-[800px]")}>
            <div className="flex gap-10 items-center max-md:flex-wrap-reverse">
              <div className="flex flex-col gap-5 w-full">
                <div>
                  {isVisit ? (
                    <div className="w-full ql-bubble story-title">
                      <div className="w-fit! h-fit! p-0! ql-editor text-3xl! sm:text-4xl! leading-tight!">
                        {HTMLReactParser(data?.title || "")}
                      </div>
                    </div>
                  ) : (
                    <ReactQuill
                      theme={theme}
                      value={formData.title}
                      placeholder="Title"
                      modules={{ toolbar: toolbarBaseOptions }}
                      onChange={(value) => handleChange("title", value)}
                    />
                  )}
                </div>
                <div>
                  {isVisit ? (
                    <div className="w-full ql-bubble">
                      <div className="w-fit! h-fit! p-0! ql-editor text-lg! text-muted-foreground">
                        {HTMLReactParser(data?.sub_title || "")}
                      </div>
                    </div>
                  ) : (
                    <ReactQuill
                      theme={theme}
                      value={formData.sub_title}
                      placeholder="Subtitle"
                      modules={{ toolbar: toolbarBaseOptions }}
                      onChange={(value) => handleChange("sub_title", value)}
                    />
                  )}
                </div>
              </div>
              {isVisit ? (
                <>
                  {data?.thumbnail_url ? (
                    <div className="relative w-full max-w-[50vw] mx-auto aspect-square">
                      <Image
                        src={data?.thumbnail_url}
                        alt={"thumbnail"}
                        fill
                        className="rounded-2xl object-cover"
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                <ImageUploader
                  label="Thumbnail"
                  value={formData.thumbnail_url}
                  onChange={(_, file) => handleChange("thumbnail_file", file)}
                />
              )}
            </div>
            {isVisit ? (
              <TagList tags={data?.tags} linked />
            ) : (
              <TagInput
                value={formData.tags}
                onChange={(value) => handleChange("tags", value)}
              />
            )}
            <div>
              {isVisit ? (
                <div className="w-full ql-bubble story-body">
                  <div className="ql-editor p-0!">
                    {HTMLReactParser(data?.content || "")}
                  </div>
                </div>
              ) : (
                <ReactQuill
                  theme={theme}
                  value={formData.content}
                  modules={{ toolbar: toolbarContentOptions }}
                  placeholder="Tell your story..."
                  onChange={(value) => handleChange("content", value)}
                />
              )}
            </div>
            {isPostView && (
              <div className="flex justify-between items-center border-y border-border py-4">
                <div
                  className="w-fit max-w-[200px] flex gap-2 items-center cursor-pointer"
                  onClick={() => push(`/profile/${data?.user_id}`)}
                >
                  <div className="relative w-[30px] h-[30px]">
                    {data?.user?.picture_url ? (
                      <Image
                        src={data.user.picture_url}
                        alt={data.user.name || ""}
                        fill
                        className="rounded-full"
                      />
                    ) : (
                      <UserIcon width={30} height={30} />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="font-semibold">{data?.user?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      @{data?.user?.handle}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user && user.id === data?.user_id && (
                    <span
                      className="flex items-center gap-1 text-sm text-muted-foreground mr-1"
                      title="Only you can see this"
                    >
                      <Eye className="w-4 h-4" />
                      {(data?.view_count ?? 0).toLocaleString()}{" "}
                      {data?.view_count === 1 ? "view" : "views"}
                    </span>
                  )}
                  <Heart
                    color={
                      user?.likes?.includes(data?.id || 0)
                        ? "var(--brand)"
                        : "var(--muted-foreground)"
                    }
                    fill={user?.likes?.includes(data?.id || 0) ? "var(--brand)" : "none"}
                    className={cn("w-5 h-5", user ? "cursor-pointer" : "")}
                    onClick={() => {
                      if (!user) return;
                      countInteraction(
                        user?.likes?.includes(data?.id || 0)
                          ? "unlike"
                          : "like",
                      );
                    }}
                  />
                  <Bookmark
                    color={
                      user?.bookmarks?.includes(data?.id || 0)
                        ? "var(--brand)"
                        : "var(--muted-foreground)"
                    }
                    fill={
                      user?.bookmarks?.includes(data?.id || 0)
                        ? "var(--brand)"
                        : "none"
                    }
                    className={cn("w-5 h-5", user ? "cursor-pointer" : "")}
                    onClick={() => {
                      if (!user) return;
                      countInteraction(
                        user?.bookmarks?.includes(data?.id || 0)
                          ? "unbookmark"
                          : "bookmark",
                      );
                    }}
                  />
                  <div
                    className="cursor-pointer flex gap-2 items-center bg-brand-soft text-foreground px-3 py-1 rounded-full text-sm"
                    onClick={() =>
                      setModalShare({
                        show: true,
                        shareUrl: window.location.href,
                      })
                    }
                  >
                    <Share2
                      color="var(--muted-foreground)"
                      className="w-4 h-4"
                    />
                    Share
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
        {user && (
          <CommentSection
            postId={data?.id}
            postOwnerId={data?.user_id}
            userId={user?.id}
            onDelete={(id, cbRefresh) => {
              toast.promise(deleteComment(id), {
                loading: "Deleting comment...",
                success: () => {
                  cbRefresh();
                  return "Comment deleted successfully";
                },
                error: "Failed to delete comment",
              });
            }}
          />
        )}
      </div>
    </>
  );
};
