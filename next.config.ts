import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.app.github.dev',
        '*.github.dev',
        '*.netlify.app',
        'pakistaniweddingplanner.netlify.app',
      ],
    },
  },
};

export default nextConfig;
