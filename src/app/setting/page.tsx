"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TApiErrorResponse } from "@/lib/api";
import { TLoginResponse } from "@/lib/api/auth";
import {
  getNotificationSettings,
  TNotificationSettingsPayload,
  updateNotificationSettings,
} from "@/lib/api/notification";
import { useUserStore } from "@/lib/stores/user.store";
import { cn } from "@/lib/utils";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/dist/client/components/navigation";
import { JSX, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "zustand";

const menus = ["notification"];

const Setting = () => {
  const [activeMenu, setActiveMenu] =
    useState<(typeof menus)[number]>("notification");
  const [mounted, setMounted] = useState(false);
  const user = useStore(useUserStore, (s) => s.user);
  const { push } = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!user) {
      push("/login");
    }
  }, [user, push]);

  const selectedMenu = useMemo(() => {
    if (!mounted || !user) return null;
    switch (activeMenu) {
      case "notification":
        return <Notification data={user} />;
      default:
        return "Notification";
    }
  }, [activeMenu, user, mounted]);

  return (
    <div className="flex flex-col gap-30 p-5 md:max-w-[70vw] w-full mx-auto">
      <span className="text-xl font-bold">Setting</span>

      <div className="w-full flex gap-5">
        <div className="min-w-[30%] max-w-[300px] shrink border-muted border-r min-h-[200px] font-medium flex flex-col gap-2.5">
          {menus.map((menu) => {
            return (
              <div
                key={menu}
                className={cn(
                  "cursor-pointer hover:bg-muted p-1 pl-2 rounded-l-md capitalize",
                  activeMenu === menu && "bg-muted",
                )}
                onClick={() => setActiveMenu(menu)}
              >
                {menu}
              </div>
            );
          })}
        </div>
        <div className="w-full">{selectedMenu}</div>
      </div>
    </div>
  );
};

const NOTIFICATION_GROUPING = {
  POST: [
    "notify_likes",
    "notify_bookmarks",
    "notify_comments",
    "notify_replies",
  ],
  USER: ["notify_follows", "notify_followed_posts_enabled"],
};

const NOTIFICATION_MESSAGES: Record<
  keyof Omit<TNotificationSettingsPayload, "notify_followed_posts_from_users">,
  { label: string; getSuccess: (checked: boolean) => JSX.Element }
> = {
  notify_comments: {
    label: "Notify me about comments",
    getSuccess: (checked) => {
      return (
        <div>
          You will <b>{checked ? "" : "not "}</b>be notified of <b>new comments</b>
        </div>
      )
    }
  },
  notify_likes: {
    label: "Notify me about likes",
    getSuccess: (checked) => {
      return (
        <div>
          You will <b>{checked ? "" : "not "}</b>be notified of <b>new likes</b>
        </div>
      )
    }
  },
  notify_follows: {
    label: "Notify me about follows",
    getSuccess: (checked) => {
      return (
        <div>
          You will <b>{checked ? "" : "not "}</b>be notified of <b>new followers</b>
        </div>
      )
    }
  },
  notify_bookmarks: {
    label: "Notify me about bookmarks",
    getSuccess: (checked) => {
      return (
        <div>
          You will <b>{checked ? "" : "not "}</b>be notified of <b>new bookmarks</b>
        </div>
      )
    }
  },
  notify_replies: {
    label: "Notify me about replies",
    getSuccess: (checked) => {
      return (
        <div>
          You will <b>{checked ? "" : "not "}</b>be notified of <b>new replies</b>
        </div>
      )
    }
  },
  notify_followed_posts_enabled: {
    label: "Notify me about new posts from followed users",
    getSuccess: (checked) => {
      return (
        <div>
          You will <b>{checked ? "" : "not "}</b>be notified of <b>new posts from followed users</b>
        </div>
      )
    },
  },
};

const Notification = ({ data }: { data: TLoginResponse }) => {
  const [values, setValues] = useState<
    Record<keyof typeof NOTIFICATION_MESSAGES, boolean>
  >({
    notify_comments: true,
    notify_likes: true,
    notify_follows: true,
    notify_bookmarks: true,
    notify_replies: true,
    notify_followed_posts_enabled: true,
  });
  const [init, setInit] = useState(false);

  const {
    data: notificationSettings,
    isFetching: isFetchingNotificationSettings,
  } = useQuery({
    queryKey: ["notifications-settings"],
    enabled: !init && !!data,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await getNotificationSettings();
      setValues((prev) => ({
        ...prev,
        ...res.data.content,
      }));
      setInit(true);
      return res.data.content;
    },
  });

  const { mutate: toggleNotification, isPending: isTogglingNotification } =
    useMutation({
      mutationFn: (data: Partial<TNotificationSettingsPayload>) =>
        updateNotificationSettings(data),
      onMutate: (data) => {
        setValues((prev) => ({
          ...prev,
          ...data,
        }));
        toast.loading("Updating notification settings...");
      },
    });

  const handleToggleNotification = (
    key: keyof typeof NOTIFICATION_MESSAGES,
    checked: boolean,
  ) => {
    const message = NOTIFICATION_MESSAGES[key]?.getSuccess(checked);
    toggleNotification(
      {
        [key]: checked,
      },
      {
        onSuccess: () => {
          toast.dismiss();
          toast.success(message);
        },
        onError: (error) => {
          toast.dismiss();
          const err = error as TApiErrorResponse;
          toast.error(err.response?.data.error);
          setValues((prev) => ({
            ...prev,
            [key]: !checked,
          }));
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {isFetchingNotificationSettings && !notificationSettings ? (
        <p>Loading...</p>
      ) : (
        <>
          {Object.entries(NOTIFICATION_GROUPING).map(
            ([group, notifications]) => {
              return (
                <div key={group} className="flex flex-col gap-5">
                  <h3 className="text-lg font-semibold underline">{group}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {notifications.map((key) => {
                      if (
                        typeof values[key as keyof typeof values] !== "boolean"
                      )
                        return null;
                      const label =
                        NOTIFICATION_MESSAGES[
                          key as keyof typeof NOTIFICATION_MESSAGES
                        ]?.label || key;
                      return (
                        <div
                          key={key}
                          id={`wrapper-${key}`}
                          className="flex gap-2 items-start"
                          onClick={() => {
                            handleToggleNotification(
                              key as keyof typeof NOTIFICATION_MESSAGES,
                              !values[
                                key as keyof typeof NOTIFICATION_MESSAGES
                              ],
                            );
                          }}
                        >
                          <Switch
                            id={key}
                            checked={
                              values[key as keyof typeof NOTIFICATION_MESSAGES]
                            }
                            className="cursor-pointer"
                            disabled={isTogglingNotification}
                          />
                          <Label
                            className="leading-none cursor-pointer"
                            htmlFor={key}
                          >
                            {label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}
        </>
      )}
    </div>
  );
};

export default Setting;
