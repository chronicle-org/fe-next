import { cache } from "react";
import type { TResponseUser } from "@/lib/api/user";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetches a profile on the server for metadata. Anonymous, so the API leaves
 * the email out.
 */
export const getPublicProfile = cache(
  async (id: number): Promise<TResponseUser | null> => {
    if (!apiUrl) return null;
    try {
      const res = await fetch(`${apiUrl}/user/${id}`, {
        next: { revalidate: 300 },
      });
      if (!res.ok) return null;
      const body = (await res.json()) as { content?: TResponseUser | null };
      return body.content ?? null;
    } catch {
      return null;
    }
  }
);
