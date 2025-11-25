"use client";
import { create } from "zustand";
import { TLoginResponse } from "@/lib/api/auth";
import { getCookie } from "@/lib/utils";

type UserStore = {
  user: TLoginResponse | null;
  setUser: (user: TLoginResponse | null) => void;
  refreshUser: () => void;
};

export const useUserStore = create<UserStore>((set) => {
  const raw = getCookie();
  let initial: TLoginResponse | null = null;

  if (raw) {
    try {
      initial = JSON.parse(raw);
    } catch { }
  }

  return {
    user: initial,
    setUser: (user) => set({ user }),
    refreshUser: () => {
      const data = getCookie();
      set({ user: data ? JSON.parse(data) : null });
    },
  };
});
