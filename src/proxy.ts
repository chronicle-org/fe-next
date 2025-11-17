import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookie } from "./lib/utils";

const authRoutes = ["/auth"];

const protectedRoutes = ["/dashboard", "/profile", "/settings"];

export function proxy(req: NextRequest) {
  const cookie = getCookie(req)
  const { pathname } = req.nextUrl;

  if (cookie && authRoutes.some((path) => pathname.startsWith(path) || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!cookie && protectedRoutes.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
}
