"use client";
import { create } from "zustand";
import { TNotificationItem } from "../api/notification";

type NotificationStore = {
  notifications: TNotificationItem[] | [];
  newNotificationsCount: number;
  setNotifications: (notifications: TNotificationItem[] | []) => void;
  onOpenNotifications: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => {

  return {
    notifications: [],
    newNotificationsCount: 0,
    setNotifications: (notifications) =>
      set({
        notifications,
        newNotificationsCount: notifications
          ? notifications.filter((n) => !n.read).length
          : 0,
      }),
    onOpenNotifications: () => set({ newNotificationsCount: 0 }),
  };
});
