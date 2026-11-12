import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: let the Android emulator (10.0.2.2) load the local dev server
  allowedDevOrigins: ["10.0.2.2"],
};

export default nextConfig;
