/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Don't reload the server when data/votes.json is written by /api/vote.
      // Without this, every vote triggers an HMR cycle that resets in-memory
      // state and can race with in-flight writes.
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          ...(Array.isArray(config.watchOptions?.ignored)
            ? config.watchOptions.ignored
            : config.watchOptions?.ignored
              ? [config.watchOptions.ignored]
              : []),
          "**/data/**",
          "**/data/votes.json",
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
