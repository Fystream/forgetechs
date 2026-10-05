import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships untranspiled ESM in places; Next handles it, but this keeps
  // the R3F dependency graph predictable across versions.
  transpilePackages: ["three"],
};

export default nextConfig;
