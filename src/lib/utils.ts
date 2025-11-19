import { clsx, type ClassValue } from "clsx"
import dayjs from "dayjs";
import "dayjs/locale/id";
import { NextRequest } from "next/server";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// COOKIE
const cookieName = "chronicle_access_token";
export const localCookieName = `${cookieName}_local`

export function setCookie(value: string, days = 1): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${localCookieName}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

export function getCookie(serverRequest?: NextRequest): string | null {
  if (serverRequest && typeof window === "undefined")
    return serverRequest.cookies.get(localCookieName)?.value || "";
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === `${localCookieName}`) return decodeURIComponent(value);
  }
  return null;
}

export function deleteCookie(): void {
  document.cookie = `${localCookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}
//

export function convertDateTime({ date, format, isLocaleId }: { date?: string; format: string; isLocaleId?: boolean; }) {
  if (!date) return "-";
  let dayjsDate = dayjs(date);
  if (isLocaleId) {
    dayjsDate = dayjsDate.locale("id");
    dayjs.locale("id");
  }
  return dayjsDate.format(format);
}

