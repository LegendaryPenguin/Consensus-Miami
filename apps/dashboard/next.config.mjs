import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Work around a Next 15 devtools userspace manifest bug in local dev.
  devIndicators: false,
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@tollgate/shared": path.resolve(__dirname, "../../packages/shared/dist/index.js"),
      "@tollgate/shared/buyer-client": path.resolve(__dirname, "../../packages/shared/dist/buyerClient.js"),
    };
    return config;
  },
};

export default nextConfig;
