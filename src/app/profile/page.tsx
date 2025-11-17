"use client";

import { TLoginResponse } from "@/lib/api/auth";
import { getUserProfile } from "@/lib/api/user";
import { getCookie } from "@/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileLayout from "./ProfileLayout";

const Profile = () => {
  const cookie: TLoginResponse = JSON.parse(getCookie() || "{}");
  const { data, refetch } = useQuery({
    queryKey: [`user-data-${cookie.id}`],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const res = await getUserProfile(cookie.id);
        if (res.status > 299 || res.data.statusCode > 299)
          throw new Error(res.data.message);
        return res.data.content;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch user data";
        toast.error(message);
        throw err;
      }
    },
  });

  if (!data)
    return (
      <div className="p-10 flex flex-col gap-10">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="flex gap-10">
          <div className="flex flex-col gap-10">
            <Skeleton className="h-[200px] aspect-square w-full rounded-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-10 w-full">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );

  return <ProfileLayout data={data} onRefetchUser={() => refetch()} />
};

export default Profile;
