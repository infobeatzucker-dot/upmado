import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained server bundle (required for Docker / Railway)
  output: "standalone",

  // Allow large audio file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "210mb",
    },
  },
  // Custom headers for SSE
  async headers() {
    return [
      {
        source: "/api/master",
        headers: [
          { key: "X-Accel-Buffering", value: "no" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
