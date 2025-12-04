import { EditIcon } from "@/components/Icons";
import { Button } from "@/components/ui/Button";
import { FancyInput } from "@/components/ui/InputFancy";
import { Spinner } from "@/components/ui/spinner";
import ImageUploader from "@/components/ui/UploadImage";
import { TApiErrorResponse } from "@/lib/api";
import {
  TFollowingAction,
  toggleFollowUser,
  TUpdatePayload,
} from "@/lib/api/user";
import { fileUploadKey } from "@/lib/constants";
import { useUserStore } from "@/lib/stores/user.store";
import { cn, convertDateTime } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Calendar1Icon, SaveIcon, UndoIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { TLoginResponse } from "@/lib/api/auth";

export const SideProfile = ({
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
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpdateProfile(formData);
  };

  const { mutate: toggleFollow, isPending: isPendingFollow } = useMutation({
    mutationFn: (action: TFollowingAction) => toggleFollowUser(data.id, action),
    onSuccess: (res, action) => {
      setUser(res.data.content as TLoginResponse);
      toast.success(action === "follow" ? "Followed" : "Unfollowed");
    },
    onError: (error) => {
      const err = error as TApiErrorResponse;
      toast.error(err.response?.data.message);
    },
  });

  return (
    <div
      className={cn(
        "flex min-[881px]:flex-col gap-5 min-[881px]:border-r",
        "max-[880px]:border-b border-muted p-2.5 md:p-10 relative"
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
        <div className="max-[400px]:absolute -top-1/3">
          <div
            className={cn(
              "relative rounded-full aspect-square",
              "max-w-[200px] w-full shrink lg:min-w-[200px] min-w-[100px]",
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
        </div>
      ) : (
        <UserIcon
          width={200}
          height={200}
          className="rounded-full border border-muted"
        />
      )}
      <div className="flex flex-col gap-5 max-w-full w-full sm:min-w-0">
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
            <div className="items-center shrink max-[400px]:mt-10">
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
      {isVisit && (
        <Button
          variant={"secondary"}
          className="max-[400px]:absolute right-2"
          disabled={isPendingFollow}
          onClick={() =>
            toggleFollow(
              user?.following?.includes(data?.id) ? "unfollow" : "follow"
            )
          }
        >
          {isPendingFollow ? (
            <Spinner />
          ) : user?.following?.includes(data?.id) ? (
            "Unfollow"
          ) : (
            "Follow"
          )}
        </Button>
      )}
    </div>
  );
};
