import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import PostCard from "@/components/ui/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { TApiErrorResponse } from "@/lib/api";
import { TLoginResponse } from "@/lib/api/auth";
import { deletePost, getAllPostsByUser, TPost } from "@/lib/api/post";
import { usePaginationQuery } from "@/lib/hooks/usePaginatedQuery";
import { useMutation } from "@tanstack/react-query";
import { BookIcon, PlusSquareIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { initPayloadData } from "./constants";

export const PostContainer = ({
  userData,
  isVisit,
  onEdit,
}: {
  userData: TLoginResponse;
  isVisit?: boolean;
  onEdit: (data: Partial<TPost>) => void;
}) => {
  const [modal, setModal] = useState<{ show: boolean; data?: TPost }>({
    show: false,
  });

  const {
    data: postsData,
    isLoading: isLoadingPostsData,
    refetch,
  } = usePaginationQuery({
    queryKey: (state) => ["posts", state],
    fetchFunction: async (params) => {
      const { filters, ...rest } = params;
      return getAllPostsByUser(userData.id, {
        ...rest,
        search: filters.search,
      });
    },
    fetchOnce: true,
    initPage: 1,
    initFilters: {
      search: "",
    },
    onError: (error) => {
      toast.error(error.response?.data.error);
    },
  });

  const { mutate: onDelete, isPending: isPendingDelete } = useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      setModal({ show: false });
      refetch();
    },
    onError: (error: TApiErrorResponse) => {
      toast.error(error.response?.data.error);
    },
  });

  return (
    <>
      <Modal
        isOpen={modal.show}
        onClose={() => setModal({ show: false })}
        title="Delete Post"
        showCloseIcon
        onConfirm={() => onDelete(modal.data?.id as number)}
        isLoading={isPendingDelete}
      >
        <p>Are you sure you want to delete this post?</p>
      </Modal>
      <div className="flex flex-col gap-5 w-full max-w-[800px] mx-auto max-sm:px-5">
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
        {isLoadingPostsData ? (
          <div className="flex flex-wrap w-full gap-2.5">
            {Array(3)
              .fill("")
              .map((_, index) => {
                return (
                  <Skeleton
                    className="h-[125px] w-full rounded-xl"
                    key={index}
                  />
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
              <PostCard
                data={post}
                key={post.id}
                onClick={() => onEdit(post)}
                onDelete={
                  isVisit
                    ? undefined
                    : () => setModal({ show: true, data: post })
                }
              />
            );
          })
        )}
      </div>
    </>
  );
};
