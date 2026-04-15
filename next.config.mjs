/** @type {import('next').NextConfig} */
const nextConfig = {
  // react-pdf uses canvas and other Node.js APIs not available in the edge runtime
  serverExternalPackages: ['@react-pdf/renderer'],

  webpack: (config) => {
    // Prevent canvas from being bundled (react-pdf optional dep)
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig
