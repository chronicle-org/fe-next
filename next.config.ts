import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.glints.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "wallpapers.com"
      },
      {
        protocol: "https",
        hostname: "nyuzfjvbsvfoegxtcanx.supabase.co"
      }
    ],
  },
};

export default nextConfig;
