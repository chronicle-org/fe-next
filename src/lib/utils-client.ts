"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUpdateParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getParam = () => {
    const params = new URLSearchParams(searchParams.toString());
    return params
  }

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);

    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key)

    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  return { getParam, setParam, removeParam };
}