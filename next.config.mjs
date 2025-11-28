/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      }
    ]
  }
};

export default nextConfig;
