/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Increase memory for build workers
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle plotly on server - it uses browser APIs
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
