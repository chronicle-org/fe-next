"use client";

import { BookIcon, Bookmark, ImageIcon, UserPlus, Users } from "lucide-react";
import { TLoginResponse } from "@/lib/api/auth";
import { cn, getCookie, setCookie } from "@/lib/utils";
import { useUpdateParam } from "@/lib/utils-client";
import Image from "next/image";
import { useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import "react-quill-new/dist/quill.bubble.css";
import { fileUploadKey } from "@/lib/constants";
import { findOne, TPost } from "@/lib/api/post";
import ImageUploader from "@/components/ui/UploadImage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadFile } from "@/lib/api/file";
import { toast } from "sonner";
import { TApiErrorResponse } from "@/lib/api";
import {
  getBookmarks,
  getFollowers,
  getFollowing,
  TUpdatePayload,
  updateProfile,
} from "@/lib/api/user";
import "quill/dist/quill.bubble.css";
import { useUserStore } from "@/lib/stores/user.store";
import { useStore } from "zustand";
import { PostSkeleton } from "../post/[id]/PostLayout";
import { SideProfile } from "./SideProfile";
import { BlogEditor } from "./BlogEditor";
import { PostContainer } from "./PostContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import UserCard from "@/components/ui/UserCard";
import PostCard from "@/components/ui/PostCard";
import { useRouter } from "next/navigation";

const ProfileLayout = ({
  data,
  isVisit = false,
  onRefetchUser,
}: {
  data: TLoginResponse;
  isVisit?: boolean;
  onRefetchUser: () => void;
}) => {
  const [edit, setEdit] = useState<{
    status?: boolean;
    data?: Partial<TPost>;
  }>();
  const [tab, setTab] = useState("posts");

  const { push } = useRouter();

  const setUser = useStore(useUserStore, (s) => s.setUser);

  const { getParam, setParam, removeParam } = useUpdateParam();

  const postId = getParam().get("post_id") || "";

  const { isFetching: isFetchingParamPostId } = useQuery({
    enabled: !!postId && !edit && tab === "posts",
    queryKey: [`post-data-${+postId}`],
    queryFn: async () => {
      try {
        if (!postId.length) throw new Error();
        const res = await findOne(+postId);
        setEdit({ status: true, data: res.data.content as TPost });
        return res.data.content;
      } catch (error) {
        setEdit({ status: false });
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

  const { data: followers, isFetching: isFetchingFollowers } = useQuery({
    enabled: tab === "followers",
    queryKey: ["followers", data.id],
    queryFn: async () => {
      try {
        const res = await getFollowers(data.id);
        return res.data.content;
      } catch (error) {
        const err = error as TApiErrorResponse;
        toast.error(err.response?.data.error);
      }
    },
  });

  const { data: following, isFetching: isFetchingFollowing } = useQuery({
    enabled: tab === "following",
    queryKey: ["following", data.id],
    queryFn: async () => {
      try {
        const res = await getFollowing(data.id);
        return res.data.content;
      } catch (error) {
        const err = error as TApiErrorResponse;
        toast.error(err.response?.data.error);
      }
    },
  });

  const { data: bookmarks, isFetching: isFetchingBookmarks } = useQuery({
    enabled: tab === "bookmarks",
    queryKey: ["bookmarks", data.id],
    queryFn: async () => {
      try {
        const res = await getBookmarks(data.id);
        return res.data.content;
      } catch (error) {
        const err = error as TApiErrorResponse;
        toast.error(err.response?.data.error);
      }
    },
  });

  return (
    <div className="sm:my-10 sm:mx-auto flex flex-col gap-10 w-full sm:max-w-[80vw]">
      <div className="flex flex-col gap-2.5 lg:gap-10 relative w-full">
        {/* BANNER */}
        <div className="relative w-full h-[100px] md:h-[200px]">
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
                  className="absolute sm:border border-foreground sm:rounded-2xl"
                />
              ) : (
                <ImageIcon className="w-full h-full self-center text-muted-foreground border border-muted rounded-2xl" />
              )}
            </>
          )}
        </div>

        <div className="flex max-[880px]:flex-col gap-2.5 md:gap-10">
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
          {edit?.status ? (
            <BlogEditor
              data={edit.data}
              onBack={() => {
                removeParam("post_id");
                setEdit({ status: false });
              }}
              isVisit={isVisit}
              onUpdatePostCounter={(post) =>
                setEdit((prev) => ({ ...prev, data: post }))
              }
            />
          ) : (
            <Tabs
              defaultValue="posts"
              value={tab}
              className="max-lg:w-full lg:w-[800px] mx-auto"
            >
              <TabsList
                className={cn(
                  "max-sm:self-center max-w-full overflow-auto justify-start",
                  "max-[400px]:rounded-none"
                )}
              >
                <TabsTrigger value="posts" onClick={() => setTab("posts")}>
                  <BookIcon className="w-5 h-5" />
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="followers"
                  onClick={() => setTab("followers")}
                >
                  <Users className="w-5 h-5" />
                  Followers
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  onClick={() => setTab("following")}
                >
                  <UserPlus className="w-5 h-5" />
                  Following
                </TabsTrigger>
                <TabsTrigger
                  value="bookmarks"
                  onClick={() => setTab("bookmarks")}
                >
                  <Bookmark className="w-5 h-5" />
                  Bookmarks
                </TabsTrigger>
              </TabsList>
              <TabsContent value="posts">
                {isFetchingParamPostId ? (
                  <PostSkeleton />
                ) : (
                  <PostContainer
                    userData={data}
                    onEdit={(post) => {
                      setEdit({ status: true, data: post });
                      if (post.id)
                        setParam("post_id", (post.id as number).toString());
                    }}
                    isVisit={isVisit}
                  />
                )}
              </TabsContent>
              <TabsContent value="followers">
                <div className="flex flex-wrap gap-2.5 mx-2.5">
                  {isFetchingFollowers ? (
                    Array(5)
                      .fill("")
                      .map((_, index) => {
                        return (
                          <Skeleton
                            className="h-[125px] aspect-square rounded-xl"
                            key={index}
                          />
                        );
                      })
                  ) : (
                    <>
                      {!followers?.length ? (
                        <div>No followers</div>
                      ) : (
                        followers?.map((follower) => {
                          return <UserCard user={follower} key={follower.id} />;
                        })
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="following">
                <div className="flex flex-wrap gap-2.5 mx-2.5">
                  {isFetchingFollowing ? (
                    Array(5)
                      .fill("")
                      .map((_, index) => {
                        return (
                          <Skeleton
                            className="h-[125px] aspect-square rounded-xl"
                            key={index}
                          />
                        );
                      })
                  ) : (
                    <>
                      {!following?.length ? (
                        <div>No following</div>
                      ) : (
                        following?.map((following) => {
                          return (
                            <UserCard user={following} key={following.id} />
                          );
                        })
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="bookmarks">
                <div className="flex flex-col gap-2.5 mx-2.5">
                  {isFetchingBookmarks ? (
                    Array(5)
                      .fill("")
                      .map((_, index) => {
                        return (
                          <Skeleton
                            className="h-[125px] rounded-xl w-full"
                            key={index}
                          />
                        );
                      })
                  ) : (
                    <>
                      {!bookmarks?.length ? (
                        <div>No bookmarks</div>
                      ) : (
                        bookmarks?.map((bookmark) => {
                          return (
                            <PostCard
                              data={bookmark}
                              key={bookmark.id}
                              onClick={() => push(`/post/${bookmark.id}`)}
                            />
                          );
                        })
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
