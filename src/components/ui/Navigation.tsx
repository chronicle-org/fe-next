"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Button } from "./Button";
import {
  DarkModeIcon,
  LightModeIcon,
  NotificationsIcon,
  SystemModeIcon,
} from "../Icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, debounce, deleteCookie } from "@/lib/utils";
import { logUserOut, TLoginResponse } from "@/lib/api/auth";
import { toast } from "sonner";
import { TApiErrorResponse } from "@/lib/api";
import {
  GalleryThumbnailsIcon,
  Pencil,
  Settings,
  UserIcon,
} from "lucide-react";
import { useUserStore } from "@/lib/stores/user.store";
import { useStore } from "zustand";
import { SearchBar } from "./SearchBar";
import { useNotificationStore } from "@/lib/stores/notification.store";
import {
  getNotifications,
  markNotificationsAsRead,
  NOTIFICATION_TYPE_ENUM,
  TNotificationItem,
} from "@/lib/api/notification";
import { InfiniteScroll } from "./InfiniteScroll";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
} from "@tanstack/react-query";

const Navigation = () => {
  const { theme, setTheme } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const user = useStore(useUserStore, (s) => s.user);
  const notifications = useStore(useNotificationStore, (s) => s.notifications);
  const setNotifications = useStore(
    useNotificationStore,
    (s) => s.setNotifications,
  );
  const newNotificationsCount = useStore(
    useNotificationStore,
    (s) => s.newNotificationsCount,
  );
  const onOpenNotifications = useStore(
    useNotificationStore,
    (s) => s.onOpenNotifications,
  );
  const searchParams = useSearchParams();

  const { isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["notifications"],
    enabled: !!user,
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getNotifications({
        page: pageParam,
        limit: 6,
      });
      const newNotifications = (res.data.content?.data || []).filter(
        (newNotif) =>
          !notifications.some((existing) => existing.id === newNotif.id),
      );
      if (newNotifications.length > 0) {
        setNotifications([...notifications, ...newNotifications]);
      }
      return res;
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;

      const loadedContent = allPages
        .map((page) => page.data.content?.data?.length)
        .reduce((a, b) => (a || 0) + (b || 0), 0);
      if ((loadedContent || 0) < (lastPage.data.content?.total || 0)) {
        return currentPage + 1;
      }
      return undefined;
    },
  });

  const onToggleTheme = () => {
    switch (theme) {
      case "light":
        setTheme("dark");
        break;

      case "dark":
        setTheme("system");
        break;

      default:
      case "system":
        setTheme("light");
        break;
    }
  };

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (ids: number[]) => await markNotificationsAsRead(ids),
    onSuccess: (res) => {
      setNotifications(
        notifications.map((notification) => {
          if (res.data.content?.some((read) => read.id === notification.id)) {
            return { ...notification, read: true };
          }
          return notification;
        }),
      );
    },
  });

  const onCloseNotifications = (ids: number[]) => {
    if (ids.length === 0) return;
    markAsRead(ids);
  };

  const onCloseNotificationsWithDebounce = debounce(onCloseNotifications, 1000);

  return (
    <nav className="bg-[#151821] text-white w-full sticky top-0 z-50">
      <ul
        className="flex gap-1 w-full justify-between p-2 px-10 max-lg:px-4 [&>li]:w-full"
        suppressHydrationWarning
      >
        <li className="flex items-center">
          <Link
            href={!!user ? "/dashboard" : "/"}
            className="flex gap-1 w-fit items-center"
          >
            <Image
              src={"/chronicle-icon.png"}
              alt="Chronicle"
              width={20}
              height={32}
              className="rounded-md"
            />
            Chronicle
          </Link>
        </li>
        <li className="flex items-center justify-center">
          <SearchBar
            key={
              pathname.includes("search") ? "search-active" : "search-inactive"
            }
            defaultValue={
              pathname.includes("search") ? searchParams.get("q") || "" : ""
            }
            onSubmit={(value) => {
              if (!value.trim()) return;
              push(`/search?q=${encodeURIComponent(value.trim())}`);
            }}
            shortcut={"/"}
          />
        </li>
        <li>
          <div className="flex justify-end items-center gap-4 min-h-9">
            {pathname !== "/auth" && !user && (
              <Button variant={"secondary"} onClick={() => push("/auth")}>
                <span className="max-sm:hidden">Start Writing!</span>
                <span className="sm:hidden">
                  <Pencil className="w-4 h-4" />
                </span>
              </Button>
            )}
            <Button
              variant={"ghost"}
              onClick={onToggleTheme}
              className="flex gap-2 p-0! h-fit hover:bg-transparent focus:ring-0! hover:text-white"
            >
              {theme === "light" && <LightModeIcon />}
              {theme === "dark" && <DarkModeIcon />}
              {theme === "system" && <SystemModeIcon />}
              <span className="capitalize min-w-11 text-start max-[400px]:hidden">
                {theme}
              </span>
            </Button>
            {pathname !== "/" && !pathname.includes("auth") && !!user && (
              <>
                <DropdownNotifications
                  notifications={notifications}
                  newNotificationsCount={newNotificationsCount}
                  onOpenNotifications={onOpenNotifications}
                  onCloseNotifications={onCloseNotificationsWithDebounce}
                  isFetching={isLoading}
                  movePage={fetchNextPage}
                  hasNextPage={hasNextPage || false}
                />
                <DropdownNavMenu user={user} />
              </>
            )}
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;

const DropdownNavMenu = ({ user }: { user: TLoginResponse | null }) => {
  const { push } = useRouter();

  const setUser = useStore(useUserStore, (s) => s.setUser);

  const handleLogout = () => {
    toast.promise(logUserOut(), {
      loading: "Loading...",
      success: async () => {
        await deleteCookie();
        setUser(null);
        push("/auth");
        return "Successfully logged out";
      },
      error: async (err: TApiErrorResponse) => {
        // Disconnect socket and clear user even on logout API failure
        await deleteCookie();
        setUser(null);
        return err.response?.data.message;
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative w-[30px] h-[30px] cursor-pointer">
          {!user?.picture_url ? (
            <UserIcon width={30} height={30} />
          ) : (
            <Image
              src={user?.picture_url || ""}
              alt={user?.name}
              fill
              className="rounded-full"
            />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" alignOffset={-30}>
        <DropdownMenuItem onClick={() => push("/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => push("/setting")}>
          Setting
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLogout()}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DropdownNotifications = ({
  notifications,
  newNotificationsCount,
  onOpenNotifications,
  onCloseNotifications,
  movePage,
  hasNextPage,
}: {
  notifications: TNotificationItem[];
  newNotificationsCount: number;
  onOpenNotifications: () => void;
  onCloseNotifications: (ids: number[]) => void;
  isFetching: boolean;
  movePage: () => void;
  hasNextPage: boolean;
}) => {
  const { push } = useRouter();
  const getNotificationLayout = (notification: TNotificationItem) => {
    let action = "";
    switch (notification.type) {
      case NOTIFICATION_TYPE_ENUM.FOLLOW:
        action = "started following you";
        break;
      case NOTIFICATION_TYPE_ENUM.POST:
        action = "created a new post";
        break;
      case NOTIFICATION_TYPE_ENUM.LIKE:
        action = "liked your post";
        break;
      case NOTIFICATION_TYPE_ENUM.COMMENT:
        action = "commented on your post";
        break;
      case NOTIFICATION_TYPE_ENUM.BOOKMARK:
        action = "bookmarked your post";
        break;
      case NOTIFICATION_TYPE_ENUM.REPLY:
        action = "replied to your comment";
        break;
    }
    const isFollow = notification.type === NOTIFICATION_TYPE_ENUM.FOLLOW;
    return (
      <Link
        href={`/${isFollow ? "profile" : "post"}/${notification.actor_id}`}
        className="w-full flex gap-2"
      >
        <div className="relative w-[45px] h-[45px] bg-background rounded-full shrink-0">
          {!notification.actor.picture_url ? (
            <UserIcon width={45} height={45} className="size-[45]" />
          ) : (
            <Image
              src={notification.actor.picture_url || ""}
              alt={notification.actor.name}
              fill
              className="rounded-full"
            />
          )}
        </div>
        <div className="flex gap-4 w-full">
          <span className="max-w-[200px] w-full text-wrap">
            {notification.actor.name} {action}
          </span>
          {!isFollow && (
            <>
              {notification.post?.thumbnail_url ? (
                <div className="relative w-[40px] h-[30px]">
                  <Image
                    src={notification.post?.thumbnail_url}
                    alt={"thumbnail"}
                    fill
                    className="rounded-md"
                  />
                </div>
              ) : (
                <GalleryThumbnailsIcon
                  width={40}
                  height={30}
                  className="size-[40]"
                />
              )}
            </>
          )}
        </div>
      </Link>
    );
  };

  const debounceMarkAsRead = debounce(
    () =>
      onCloseNotifications(
        notifications
          .filter((notification) => !notification.read)
          .map((notification) => notification.id),
      ),
    1000,
  );

  const onToggleOpen = (open: boolean) => {
    if (open) {
      onOpenNotifications();
      debounceMarkAsRead();
    }
  };

  return (
    <DropdownMenu onOpenChange={onToggleOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative aspect-square rounded-full w-fit h-fit p-2!"
        >
          <NotificationsIcon className="size-[16]" />
          {newNotificationsCount > 0 && (
            <div
              className={cn(
                "bg-red-700 rounded-full text-white font-bold text-[10px] absolute top-0 -right-1 aspect-square h-4",
                newNotificationsCount > 99 ? "p-0" : "p-[1px]",
              )}
            >
              {newNotificationsCount > 99 ? "99+" : newNotificationsCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[300px] overflow-y-auto"
      >
        <DropdownMenuItem 
          className="flex justify-end p-2 w-fit self-end ml-auto [&_svg]:pointer-events-auto! group"
          onClick={() => push("/setting")}
        >
          <Settings
            width={20}
            height={20}
            className={cn(
              "group-hover:rotate-45 group-hover:text-gray-500",
              "size-[20] cursor-pointer transition-all",
            )}
          />
        </DropdownMenuItem>
        {!notifications.length ? (
          <DropdownMenuItem
            className="text-gray-500!"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            No new notifications
          </DropdownMenuItem>
        ) : (
          notifications.map((notification) => {
            return (
              <DropdownMenuItem
                key={notification.id}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {getNotificationLayout(notification)}
              </DropdownMenuItem>
            );
          })
        )}
        {hasNextPage && (
          <InfiniteScroll loadMore={movePage} hasMore={hasNextPage} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
