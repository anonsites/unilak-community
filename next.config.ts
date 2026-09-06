import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tqjwgqpwjrykvmdjlklt.supabase.co",
        pathname: "/storage/v1/object/public/event-flyers/**",
      },
    ],
  },
};

export default nextConfig;
