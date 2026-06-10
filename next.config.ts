import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagesplashh.vercel.app",
        pathname: "/api/image/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "instagram.fidr4-1.fna.fbcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "instagram.fidr4-2.fna.fbcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "instagram.fidr4-3.fna.fbcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
