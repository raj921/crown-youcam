import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The API reads the committed demo cache and product photos from disk, so ship them with the functions.
  outputFileTracingIncludes: { "/api/**": ["./cache/**/*", "./public/products/**/*"] },
};

export default nextConfig;
