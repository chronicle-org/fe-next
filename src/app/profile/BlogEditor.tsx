import {
  ChevronIcon,
  PasswordHideIcon,
  PasswordShowIcon,
} from "@/components/Icons";
import { Button } from "@/components/ui/Button";
import { CommentSection } from "@/components/ui/CommentSection";
import { Modal } from "@/components/ui/Modal";
import ImageUploader from "@/components/ui/UploadImage";
import { TApiErrorResponse } from "@/lib/api";
import { TLoginResponse } from "@/lib/api/auth";
import { deleteComment } from "@/lib/api/comment";
import { uploadFile } from "@/lib/api/file";
import {
  addPost,
  editPost,
  TAddPostPayload,
  TPost,
  updateInteraction,
} from "@/lib/api/post";
import {
  fileUploadKey,
  toolbarBaseOptions,
  toolbarContentOptions,
} from "@/lib/constants";
import { useUserStore } from "@/lib/stores/user.store";
import { InteractionType } from "@/lib/types";
import { updateCookie } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import HTMLReactParser from "html-react-parser/lib/index";
import {
  Bookmark,
  Check,
  Copy,
  GalleryThumbnailsIcon,
  Heart,
  LinkIcon,
  Share2,
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
    data || initPayloadData
  );
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
    []
  );

  const { mutate: upload, isPending: isUploadingFile } = useMutation({
    mutationFn: (data: { file: File; type: keyof typeof fileUploadKey }) =>
      uploadFile(data.file, data.type),
  });

  const { mutate: submitPost, isPending: isSubmittingPost } = useMutation({
    mutationFn: (data: TAddPostPayload) => addPost(data),
    onSuccess: () => onBack?.(),
    onError: (err: TApiErrorResponse) => {
      toast.error(err.response?.data.error);
    },
  });

  const { mutate: updatePost, isPending: isUpdatingPost } = useMutation({
    mutationFn: (payload: { id: number; data: Partial<TAddPostPayload> }) =>
      editPost(payload.id, payload.data),
    onSuccess: () => onBack?.(),
    onError: (err: TApiErrorResponse) => {
      toast.error(err.response?.data.error);
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { thumbnail_file, ...rest } = formData;
    if (!!thumbnail_file)
      await upload(
        { file: thumbnail_file, type: 1 },
        {
          onSuccess: async (res) => {
            const newData = {
              title: formData.title,
              sub_title: formData.sub_title,
              thumbnail_url: res.data.content?.url,
              content: formData.content,
            };
            if (data?.id) await updatePost({ id: data.id, data: newData });
            else await submitPost(newData as TAddPostPayload);
          },
          onError: (error) => {
            const err = error as TApiErrorResponse;
            toast.error(err.response?.data.error);
          },
        }
      );
    else {
      if (data?.id) await updatePost({ id: data.id, data: rest });
      else await submitPost(rest as TAddPostPayload);
    }
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

  const { mutate: countInteraction, isPending: isCountingInteraction } =
    useMutation({
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
            error: (err) => err.response?.data.message,
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

  useEffect(() => {
    if (!data?.id || initRef.current) return;
    if (isVisit || isPostView) {
      initRef.current = true;
      countInteraction("view");
    }
  }, [isVisit, isPostView]);

  return (
    <>
      <Modal
        isOpen={modalShare.show}
        onClose={() => setModalShare({ show: false })}
      >
        <div className="flex flex-col gap-2">
          <div className="flex rounded-lg shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              <LinkIcon className="w-4 h-4" />
            </span>
            <input
              id="share-link"
              ref={urlInputRef}
              type="text"
              readOnly
              value={modalShare.shareUrl}
              className="flex-1 min-w-0 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center px-4 py-2 rounded-r-lg text-sm font-medium transition duration-150 ease-in-out cursor-pointer",
                copied
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600"
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
                    setModalShare({
                      show: true,
                      shareUrl: platform.getShareUrl(window.location.href),
                    });
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

                <Button
                  variant={"secondary"}
                  type="submit"
                  disabled={
                    isUploadingFile || isSubmittingPost || isUpdatingPost
                  }
                >
                  Submit
                </Button>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-10 max-w-[800px] mx-auto">
            <div className="flex gap-10 items-center max-md:flex-wrap-reverse">
              <div className="flex flex-col gap-5 w-full">
                <div>
                  {isVisit ? (
                    <div className="w-full ql-bubble">
                      <div className="line-clamp-2 w-fit! h-fit! p-0! ql-editor">
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
                      <div className="line-clamp-2 w-fit! h-fit! p-0! ql-editor">
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
                  ) : (
                    <GalleryThumbnailsIcon className="w-full aspect-square" />
                  )}
                </>
              ) : (
                <ImageUploader
                  label="Thumbnail"
                  value={formData.thumbnail_url}
                  onChange={(_, file) => handleChange("thumbnail_file", file)}
                />
              )}
            </div>
            <div>
              {isVisit ? (
                <div className="w-full ql-bubble">
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
              <div className="flex justify-between items-center">
                <div
                  className="w-fit max-w-[200px] flex gap-2 items-center cursor-pointer"
                  onClick={() => push(`/profile/${data?.user_id}`)}
                >
                  <div className="relative w-[30px] h-[30px]">
                    <Image
                      src={data?.user?.picture_url || ""}
                      alt={data?.user?.name || ""}
                      fill
                      className="rounded-full"
                    />
                  </div>

                  <div className="flex flex-col">
                    <div className="font-semibold">{data?.user?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      @{data?.user?.handle}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Heart
                    color={
                      user?.likes?.includes(data?.id || 0)
                        ? "red"
                        : "var(--muted-foreground)"
                    }
                    fill={user?.likes?.includes(data?.id || 0) ? "red" : "none"}
                    className="w-5 h-5 cursor-pointer"
                    onClick={() =>
                      countInteraction(
                        user?.likes?.includes(data?.id || 0) ? "unlike" : "like"
                      )
                    }
                  />
                  <Bookmark
                    color={
                      user?.bookmarks?.includes(data?.id || 0)
                        ? "yellow"
                        : "var(--muted-foreground)"
                    }
                    fill={
                      user?.bookmarks?.includes(data?.id || 0)
                        ? "yellow"
                        : "none"
                    }
                    className="w-5 h-5 cursor-pointer"
                    onClick={() =>
                      countInteraction(
                        user?.bookmarks?.includes(data?.id || 0)
                          ? "unbookmark"
                          : "bookmark"
                      )
                    }
                  />
                  <div
                    className="cursor-pointer flex gap-2 items-center bg-muted text-muted-foreground px-2 py-1 rounded"
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
