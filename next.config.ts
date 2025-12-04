import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Homegate CDN domains for listing images
      {
        protocol: "https",
        hostname: "s.homegate.ch",
      },
      {
        protocol: "https",
        hostname: "*.homegate.ch",
      },
      {
        protocol: "https",
        hostname: "cdn.homegate.ch",
      },
      {
        protocol: "https",
        hostname: "images.homegate.ch",
      },
      // ImmoScout24 (same company, shared CDN)
      {
        protocol: "https",
        hostname: "*.immoscout24.ch",
      },
      {
        protocol: "https",
        hostname: "s.immoscout24.ch",
      },
    ],
  },
};

export default nextConfig;
