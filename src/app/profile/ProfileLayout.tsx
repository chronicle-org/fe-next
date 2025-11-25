"use client";

import {
  ChevronIcon,
  CommentIcon,
  EditIcon,
  PasswordHideIcon,
  PasswordShowIcon,
} from "@/components/Icons";
import { Button } from "@/components/ui/Button";
import { TLoginResponse } from "@/lib/api/auth";
import { cn, convertDateTime, getCookie, setCookie } from "@/lib/utils";
import { useUpdateParam } from "@/lib/utils-client";
import Image from "next/image";
import { FormEvent, useMemo, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import "react-quill-new/dist/quill.bubble.css";
import {
  toolbarContentOptions,
  toolbarBaseOptions,
  fileUploadKey,
} from "@/lib/constants";
import dynamic from "next/dynamic";
import {
  addPost,
  editPost,
  findOne,
  getAllPostsByUser,
  TAddPostPayload,
  TPost,
} from "@/lib/api/post";
import ImageUploader from "@/components/ui/UploadImage";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { uploadFile } from "@/lib/api/file";
import { toast } from "sonner";
import { TApiErrorResponse } from "@/lib/api";
import PostCard from "@/components/ui/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookIcon,
  Calendar1Icon,
  GalleryThumbnailsIcon,
  ImageIcon,
  PlusSquareIcon,
  SaveIcon,
  UndoIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { FancyInput } from "@/components/ui/InputFancy";
import { CommentSection } from "@/components/ui/CommentSection";
import { TUpdatePayload, updateProfile } from "@/lib/api/user";
import HTMLReactParser from "html-react-parser/lib/index";
import "quill/dist/quill.bubble.css";
import { Textarea } from "@/components/ui/textarea";
import { getAllByPostId, postComment } from "@/lib/api/comment";
import { Spinner } from "@/components/ui/spinner";
import { useUserStore } from "@/lib/stores/user.store";
import { useStore } from "zustand";
import { useRouter } from "next/navigation";
import { PostSkeleton } from "../post/[id]/PostLayout";

const ProfileLayout = ({
  data,
  // postId,
  isVisit = false,
  onRefetchUser,
}: {
  data: TLoginResponse;
  // postId?: number
  isVisit?: boolean;
  onRefetchUser: () => void;
}) => {
  const [edit, setEdit] = useState<Partial<TPost>>();

  const setUser = useStore(useUserStore, (s) => s.setUser);

  const { getParam, setParam, removeParam } = useUpdateParam();

  const postId = getParam().get("post_id") || "";

  const { isFetching: isFetchingParamPostId } = useQuery({
    enabled: !!postId && !edit,
    queryKey: [`post-data-${+postId}`],
    queryFn: async () => {
      try {
        // console.log("masuk")
        if (!postId.length) throw new Error()
        const res = await findOne(+postId);
        setEdit(res.data.content as TPost);
        return res.data.content;
      } catch (error) {
        setEdit(undefined)
        const err = error as TApiErrorResponse;
        toast.error(err.response?.data.error || "Post not found");
      }
    },
  });

  const { mutate: upload, isPending: isUploadingFile } = useMutation({
    mutationFn: (data: { file: File; type: keyof typeof fileUploadKey }) =>
      uploadFile(data.file, data.type),
  });

  const { mutate: updateProfileData, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: (data: TUpdatePayload) => updateProfile(data),
      onSuccess: async (res) => {
        const cookie = getCookie();
        const currentCookie: TLoginResponse = JSON.parse(cookie || "{}");
        const newUserData = { ...currentCookie, ...res.data.content };
        setUser(newUserData);
        const parsedCookie = JSON.stringify(newUserData);
        await setCookie(parsedCookie);
        toast.success("Profile updated");
        onRefetchUser();
      },
      onError: (error) => {
        const err = error as TApiErrorResponse;
        toast.error(err.response?.data.error);
      },
    });

  return (
    <div className="my-10 mx-auto flex flex-col gap-10 w-full max-w-[80vw]">
      <div className="flex flex-col gap-10 relative w-full">
        {/* BANNER */}
        <div className="relative w-full h-[200px]">
          {!isVisit ? (
            <ImageUploader
              value={data.banner_url}
              onChange={async (_, file) => {
                if (file)
                  await upload(
                    { file, type: 2 },
                    {
                      onSuccess: async (res) => {
                        await updateProfileData({
                          banner_url: res.data.content?.url,
                        });
                      },
                      onError: (error) => {
                        const err = error as TApiErrorResponse;
                        toast.error(err.response?.data.error);
                      },
                    }
                  );
              }}
              disabled={isUploadingFile || isUpdatingProfile}
              mode="overlay"
              layout="fill"
            />
          ) : (
            <>
              {data.banner_url ? (
                <Image
                  src={data.banner_url || ""}
                  alt={data.banner_url || ""}
                  fill
                  className="absolute border border-foreground rounded-2xl"
                />
              ) : (
                <ImageIcon className="w-full h-full self-center text-muted-foreground border border-muted rounded-2xl" />
              )}
            </>
          )}
        </div>

        <div className="flex max-[880px]:flex-col gap-10">
          <SideProfile
            data={data}
            isPending={isUploadingFile || isUpdatingProfile}
            isVisit={isVisit}
            onUpload={(file, type) => {
              upload(
                { file, type },
                {
                  onSuccess: async (res) => {
                    await updateProfileData({
                      picture_url: res.data.content?.url,
                    });
                  },
                  onError: (error) => {
                    const err = error as TApiErrorResponse;
                    toast.error(err.response?.data.error);
                  },
                }
              );
            }}
            onUpdateProfile={updateProfileData}
          />
          {isFetchingParamPostId ? (
            <PostSkeleton />
          ) : (
            <>
              {edit && !!postId ? (
                <BlogEditor
                  data={edit}
                  onBack={() => {
                    removeParam("post_id");
                    setEdit(undefined);
                  }}
                  isVisit={isVisit}
                />
              ) : (
                <PostContainer
                  userData={data}
                  onEdit={(post) => {
                    setParam("post_id", (post.id as number).toString());
                    setEdit(post);
                  }}
                  isVisit={isVisit}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;

const SideProfile = ({
  data,
  isVisit,
  isPending,
  onUpload,
  onUpdateProfile,
}: {
  data: TLoginResponse;
  isVisit?: boolean;
  onUpload: (file: File, type: keyof typeof fileUploadKey) => void;
  onUpdateProfile: (data: TUpdatePayload) => void;
  isPending: boolean;
}) => {
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<TUpdatePayload>(data);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpdateProfile(formData);
  };
  return (
    <div
      className={cn(
        "flex min-[881px]:flex-col gap-5 min-[881px]:border-r",
        "max-[880px]:border-b border-muted p-10 max-lg:p-5"
      )}
    >
      {/* PROFILE PICTURE */}
      {!isVisit ? (
        <div className="w-[200px] h-[200px]">
          <ImageUploader
            value={data.picture_url}
            onChange={(_, file) => {
              if (file) onUpload(file, 3);
            }}
            mode="overlay"
            layout="fill"
            disabled={isPending}
            imageClassName="rounded-full"
          />
        </div>
      ) : data.picture_url ? (
        <div
          className={cn(
            "relative rounded-full aspect-square",
            "max-w-[200px] w-full min-w-[100px]",
            "border border-foreground bg-accent-foreground",
            "overflow-hidden h-fit"
          )}
        >
          <Image
            src={data.picture_url}
            alt={data.picture_url}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <UserIcon
          width={200}
          height={200}
          className="rounded-full border border-muted"
        />
      )}

      <div className="flex flex-col gap-5 max-w-full min-w-0">
        {isEdit ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <FancyInput
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <FancyInput
              label="Bio"
              value={formData.profile_description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  profile_description: e.target.value,
                }))
              }
            />
          </form>
        ) : (
          <>
            <div className="items-center shrink">
              <div className="wrap-anywhere break-all line-clamp-1">
                {data.name}
              </div>
              <div className="text-sm text-muted-foreground wrap-anywhere break-all line-clamp-1">
                @{data.handle}
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={`mailto:${data.email}`}
                  className="text-sm text-blue-500 wrap-anywhere break-all line-clamp-1"
                >
                  {data.email}
                </Link>
              </div>
            </div>
            <div className="wrap-anywhere break-all line-clamp-1">
              {data.profile_description}
            </div>
            <div className="flex items-center text-muted-foreground text-sm gap-1">
              <Calendar1Icon height={16} width={16} />
              {convertDateTime({
                date: data.created_at,
                format: "D MMMM YYYY",
              })}
            </div>
          </>
        )}
        {isEdit ? (
          <div className="flex gap-2">
            <Button
              variant={"secondary"}
              className="w-fit"
              onClick={() => {
                setIsEdit(false);
                onUpdateProfile(formData);
              }}
              disabled={isPending}
            >
              <SaveIcon />
            </Button>
            <Button
              variant={"destructive"}
              className="w-fit"
              onClick={() => setIsEdit(false)}
              disabled={isPending}
            >
              <UndoIcon />
            </Button>
          </div>
        ) : (
          !isVisit && (
            <Button
              variant={"secondary"}
              className="w-fit"
              onClick={() => setIsEdit(true)}
              disabled={isPending}
            >
              <EditIcon color="var(--foreground)" />
            </Button>
          )
        )}
      </div>
    </div>
  );
};

type TEditorTheme = "snow" | "bubble";

const initPayloadData: TAddPostPayload & { thumbnail_file?: File } = {
  title: "",
  sub_title: "",
  thumbnail_url: "",
  content: "",
};

export const BlogEditor = ({
  data,
  isVisit,
  isPostView,
  onBack,
}: {
  data?: Partial<TPost>;
  isVisit?: boolean;
  isPostView?: boolean;
  onBack?: () => void;
}) => {
  const { push } = useRouter();
  const user = useUserStore((state) => state.user);
  const [formData, setFormData] = useState<Partial<typeof initPayloadData>>(
    data || initPayloadData
  );
  const [theme, setTheme] = useState<TEditorTheme>("snow");
  const formRef = useRef<HTMLFormElement>(null);
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill-new"), { ssr: false }),
    []
  );

  const { mutate: upload, isPending: isUploadingFile } = useMutation({
    mutationFn: (data: { file: File; type: keyof typeof fileUploadKey }) =>
      uploadFile(data.file, data.type),
    // onSuccess: (res) => {
    //   setFormData((prev) => ({
    //     ...prev,
    //     thumbnail_url: res.data.content?.url,
    //   }));
    // },
    // onError: (err: TApiErrorResponse) => {
    //   toast.error(err.response?.data.error);
    // },
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
  return (
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
                disabled={isUploadingFile || isSubmittingPost || isUpdatingPost}
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
          )}
        </div>
      </form>
      {isVisit && user && <CommentSection postId={data?.id} userId={user?.id} />}
    </div>
  );
};

export const PostContainer = ({
  userData,
  isVisit,
  onEdit,
}: {
  userData: TLoginResponse;
  isVisit?: boolean;
  onEdit: (data: Partial<TPost>) => void;
}) => {
  // const {
  //   data,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage,
  // } = useInfiniteQuery({
  //   queryKey: ["posts"],
  //   queryFn: ({ pageParam = 1 }) => getAllPostsByUser(),
  //   getNextPageParam: (lastPage) => lastPage.nextPage ?? false,
  // });

  const { data: postsData, isFetching: isFetchingPostsData } = useQuery({
    queryKey: [`user-${userData.id}-posts`],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const res = await getAllPostsByUser(userData.id);
        return res.data.content;
      } catch (error) {
        const err = error as TApiErrorResponse;
        toast.error(err.response?.data.error);
      }
    },
  });

  return (
    <div className="flex flex-col gap-5 w-full max-w-[800px] mx-auto">
      {!isVisit && (
        <Button
          variant={"secondary"}
          className="w-fit self-end"
          onClick={() => onEdit(initPayloadData)}
        >
          <PlusSquareIcon />
          New
        </Button>
      )}
      {isFetchingPostsData ? (
        <div className="flex flex-wrap w-full gap-2.5">
          {Array(3)
            .fill("")
            .map((_, index) => {
              return (
                <Skeleton className="h-[125px] w-full rounded-xl" key={index} />
              );
            })}
        </div>
      ) : !postsData?.length ? (
        <div className="flex flex-col gap-5 mx-auto items-center text-muted-foreground flex-1 justify-center">
          <BookIcon width={50} height={50} />
          <p>{isVisit ? "No post found" : "Start creating your story"}</p>
        </div>
      ) : (
        postsData.map((post) => {
          return (
            <PostCard data={post} key={post.id} onClick={() => onEdit(post)} />
          );
        })
      )}
    </div>
  );
};

// const CommentCard = ({ data }: { data: TComment }) => {
//   return (
//     <div ></div>
//   )
// }


