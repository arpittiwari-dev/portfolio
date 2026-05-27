import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  compress: true,
  poweredByHeader: false,
  // Prevent trailing slash redirect on API routes (POST body is lost on redirect)
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/api/upload", destination: "/api/upload" },
        { source: "/api/projects", destination: "/api/projects" },
        { source: "/api/projects/:id", destination: "/api/projects/:id" },
      ],
    };
  },
};

export default nextConfig;
