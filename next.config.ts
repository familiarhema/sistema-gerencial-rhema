/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    PORT: 3002,
  },
  server: {
    port: 3002,
  },
};

module.exports = nextConfig;
