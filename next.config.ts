import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Exclude test files from ESLint during build
    dirs: ['src/app', 'src/lib', 'src/components'],
  },
  typescript: {
    // Exclude test files from TypeScript checking during build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
