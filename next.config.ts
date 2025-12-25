import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    // 👇 Добавь вот эти строки:
    typescript: {
        // !! ВНИМАНИЕ !!
        // Опасно: разрешает сборку, даже если есть ошибки типизации.
        ignoreBuildErrors: true,
    },
  /* config options here */
};

export default nextConfig;
