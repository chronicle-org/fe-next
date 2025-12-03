import { Facebook, Linkedin, Mail, MessageSquare, Twitter } from "lucide-react";
import { TAddPostPayload } from "@/lib/api/post";

export type TEditorTheme = "snow" | "bubble";

export const initPayloadData: TAddPostPayload & { thumbnail_file?: File } = {
  title: "",
  sub_title: "",
  thumbnail_url: "",
  content: "",
};

export type TSharePlatform = {
  name: string;
  icon: React.ElementType;
  color: string;
  baseUrl: string;
  getShareUrl: (url: string, title?: string) => string;
};

export const SharePlatforms: TSharePlatform[] = [
  {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600 hover:bg-blue-700",
    baseUrl: "https://www.facebook.com/sharer/sharer.php",
    getShareUrl: (url) =>
      `${SharePlatforms[0].baseUrl}?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Twitter (X)",
    icon: Twitter,
    color: "bg-black dark:bg-white dark:text-black hover:bg-gray-800",
    baseUrl: "https://twitter.com/intent/tweet",
    getShareUrl: (url, title = "Check this out!") =>
      `${SharePlatforms[1].baseUrl}?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700 hover:bg-blue-800",
    baseUrl: "https://www.linkedin.com/shareArticle",
    getShareUrl: (url, title = "Check this out!") =>
      `${SharePlatforms[2].baseUrl}?mini=true&url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title)}`,
  },
  {
    name: "WhatsApp",
    icon: MessageSquare,
    color: "bg-green-500 hover:bg-green-600",
    baseUrl: "https://wa.me/",
    getShareUrl: (url, title = "Check this out!") =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        title + " " + url
      )}`,
  },
  {
    name: "Email",
    icon: Mail,
    color: "bg-gray-500 hover:bg-gray-600",
    baseUrl: "mailto:",
    getShareUrl: (url, title = "Check out this video!") =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        `Watch it here: ${url}`
      )}`,
  },
];
