import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@finastra/types"],
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.finastrafest.in"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ],
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
