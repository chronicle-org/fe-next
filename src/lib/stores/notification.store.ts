"use client";
import { create } from "zustand";
import { TNotificationItem } from "../api/notification";

type NotificationStore = {
  notifications: TNotificationItem[] | [];
  newNotificationsCount: number;
  setNotifications: (notifications: TNotificationItem[] | []) => void;
  removeNotification: (id: number) => void;
  markNotificationsRead: (ids: number[]) => void;
  onOpenNotifications: () => void;
};

const countUnread = (notifications: TNotificationItem[]) =>
  notifications ? notifications.filter((n) => !n.read).length : 0;

export const useNotificationStore = create<NotificationStore>((set) => {

  return {
    notifications: [],
    newNotificationsCount: 0,
    setNotifications: (notifications) =>
      set({
        notifications,
        newNotificationsCount: countUnread(notifications),
      }),
    removeNotification: (id) =>
      set((state) => {
        const removed = state.notifications.find((n) => n.id === id);
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          newNotificationsCount:
            removed && !removed.read
              ? Math.max(0, state.newNotificationsCount - 1)
              : state.newNotificationsCount,
        };
      }),
    markNotificationsRead: (ids) =>
      set((state) => {
        const newlyRead = state.notifications.filter(
          (n) => !n.read && ids.includes(n.id),
        ).length;
        return {
          notifications: state.notifications.map((n) =>
            ids.includes(n.id) ? { ...n, read: true } : n,
          ),
          newNotificationsCount: Math.max(
            0,
            state.newNotificationsCount - newlyRead,
          ),
        };
      }),
    onOpenNotifications: () => set({ newNotificationsCount: 0 }),
  };
});
