import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.ctfassets.net" },
      { protocol: "https", hostname: "downloads.ctfassets.net" },
      { protocol: "https", hostname: "dev1-api-hybris.omega.com" },
      { protocol: "https", hostname: "assets.dwyeromega.com" },
    ],
  },
};

export default nextConfig;
