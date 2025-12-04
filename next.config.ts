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
      // Anibis
      {
        protocol: "https",
        hostname: "*.anibis.ch",
      },
      // Facebook
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
      // Ricardo
      {
        protocol: "https",
        hostname: "*.ricardo.ch",
      },
      // Comparis
      {
        protocol: "https",
        hostname: "*.comparis.ch",
      },
    ],
  },

  // CORS headers for Chrome extension
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            // Use * for development, replace with extension ID in production:
            // chrome-extension://YOUR_EXTENSION_ID
            value: process.env.EXTENSION_ORIGIN || "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, Cookie",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
