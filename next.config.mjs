/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // <--- 이 부분이 핵심입니다! (카메라 중복 실행 방지)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
