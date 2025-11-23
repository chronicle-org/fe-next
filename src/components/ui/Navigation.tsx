"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Button } from "./Button";
import { DarkModeIcon, LightModeIcon } from "../Icons";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCookie } from "@/lib/utils";
import { logUserOut, TLoginResponse } from "@/lib/api/auth";
import { toast } from "sonner";
import { TApiErrorResponse } from "@/lib/api";
import { UserIcon } from "lucide-react";
import { useUserStore } from "@/lib/stores/user.store";
import { useStore } from "zustand";

const Navigation = () => {
  const { theme, setTheme } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const user = useStore(useUserStore, (s) => s.user);

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

  return (
    <nav className="bg-[#151821] text-white w-full sticky top-0 z-50">
      <ul
        className="flex gap-1 w-full justify-between p-2 px-10 max-lg:px-4 [&>li]:w-full"
        suppressHydrationWarning
      >
        <li className="flex items-center">
          <Link href={!!user ? "/dashboard" : "/"} className="flex gap-1 w-fit items-center">
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
        <li>
          <div className="flex justify-end items-center gap-4 min-h-9">
            {pathname !== "/" ? (
              <></>
            ) : (
              <Button variant={"secondary"} onClick={() => push("/auth")}>
                Start Writing!
              </Button>
            )}
            <Button
              variant={"ghost"}
              onClick={onToggleTheme}
              className="flex gap-2 p-0! h-fit hover:bg-transparent focus:ring-0! hover:text-white"
            >
              {theme === "light" ? <LightModeIcon /> : <DarkModeIcon />}
              <span className="capitalize min-w-11 text-start">{theme}</span>
            </Button>
            {pathname !== "/" && !pathname.includes("auth") && (
              <DropdownNavMenu user={user} />
            )}
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;

const DropdownNavMenu = ({ user }: { user:  TLoginResponse | null }) => {
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
      error: (err: TApiErrorResponse) => {
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
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => push("/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLogout()}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
