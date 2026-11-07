import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    // Fotos dos produtos, banners e logo vem do Storage do Supabase (cloudfy).
    // A Vercel redimensiona, converte para WebP e guarda em cache.
    remotePatterns: [
      { protocol: "https", hostname: "smellinggreenlandshark-supabase.cloudfy.live", pathname: "/storage/v1/object/public/**" },
    ],
    formats: ["image/webp"],
    // Poucas larguras = menos variacoes geradas (conta na cota de otimizacao da Vercel).
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [96, 256, 384],
    qualities: [75],
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
