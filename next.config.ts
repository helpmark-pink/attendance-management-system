import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 超高速化設定
  experimental: {
    optimizePackageImports: ['date-fns', 'react', 'react-dom'],
    // Turbopack (開発モード高速化)
    turbo: {
      resolveAlias: {
        // エイリアスの最適化
      },
    },
  },

  // Reactの厳格モードを無効化（開発速度優先）
  reactStrictMode: false,

  // 画像最適化
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // コンパイルの最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // TypeScriptとESLint (開発モードでは無効化)
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // パフォーマンス最適化
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
