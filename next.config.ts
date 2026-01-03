import type { NextConfig } from 'next'
import withPWA from '@ducanh2912/next-pwa'

const nextConfig: NextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})({
  reactStrictMode: true,
  webpack: (config, { webpack }) => {
    config.resolve.fallback = { fs: false, path: false, crypto: false }
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[hash][ext][query]'
      }
    })
    config.resolve.alias = {
      ...config.resolve.alias,
      'MediaInfoModule.wasm': false
    }
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /MediaInfoModule\.wasm$/
      })
    )
    return config
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          }
        ]
      }
    ]
  },
  rewrites: async () => {
    return {
      fallback: [
        {
          source: '/:path*',
          destination: '/'
        }
      ]
    }
  }
})

export default nextConfig
