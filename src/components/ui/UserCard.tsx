"use client";

import { TLoginResponse } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const UserCard = ({
  user,
}: {
  user: Omit<TLoginResponse, "acccess_token">;
}) => {
  const { push } = useRouter();
  return (
    <Link href={`/profile/${user.id}`}>
      <div
        className={cn(
          "flex flex-col gap-2.5 w-[150px] aspect-square text-sm",
          "border border-muted rounded-2xl p-2.5 cursor-pointer"
        )}
        onClick={() => push(`/profile/${user.id}`)}
      >
        <div className="flex gap-2.5 items-center overflow-hidden max-w-full">
          {!user.picture_url ? (
            <UserIcon className="min-w-[30px] aspect-square" />
          ) : (
            <div className="min-w-[30px] aspect-square relative">
              <Image
                src={user.picture_url}
                alt={user.name}
                fill
                className="rounded-full"
              />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <div className="truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {user.handle}
            </div>
          </div>
        </div>

        <div>{user.profile_description}</div>
      </div>
    </Link>
  );
};

export default UserCard;
