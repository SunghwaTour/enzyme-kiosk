"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TutorialOverlay from "@/components/TutorialOverlay";

export default function Home() {
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8 relative">
      {/* ✨ page="home" 전달 */}
      <TutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        page="home"
      />

      <button
        onClick={() => setShowTutorial(true)}
        className="absolute top-8 right-8 bg-white p-4 rounded-full shadow-lg border-2 border-stone-200 text-stone-600 hover:bg-stone-100 hover:scale-110 hover:rotate-12 transition-all duration-300 z-10 group"
        title="도움말 보기"
      >
        <span className="text-2xl font-bold block group-hover:animate-pulse">
          ❓
        </span>
        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-2 py-1 rounded-md shadow-sm">
          사용법
        </span>
      </button>

      {/* ... (이하 기존 코드와 동일) ... */}
      <div className="text-center mb-12 animate-in slide-in-from-top-10 duration-700">
        <h1 className="text-5xl font-extrabold text-[#4A5D4F] mb-4 tracking-tight drop-shadow-sm">
          내몸에 효소욕
        </h1>
        <p className="text-xl text-stone-500 font-medium">
          원하시는 메뉴를 선택해주세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        <button
          onClick={() => router.push("/purchase")}
          className="group relative overflow-hidden bg-white p-10 rounded-[2.5rem] shadow-xl border border-stone-100 hover:border-emerald-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
              🎫
            </span>
            <span className="text-3xl font-bold text-gray-800 mb-2">
              이용권 구매
            </span>
            <span className="text-stone-500 text-lg">시간/기간권 충전하기</span>
          </div>
        </button>

        <button
          onClick={() => router.push("/entry")}
          className="group relative overflow-hidden bg-[#4A5D4F] p-10 rounded-[2.5rem] shadow-xl hover:bg-[#3A4D3F] hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex flex-col items-center text-white">
            <span className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
              🚪
            </span>
            <span className="text-3xl font-bold mb-2">입장하기</span>
            <span className="text-emerald-100 text-lg">QR 찍고 입실하기</span>
          </div>
        </button>

        <button
          onClick={() => router.push("/check")}
          className="group bg-white p-8 rounded-[2rem] shadow-lg border border-stone-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center hover:-translate-y-1"
        >
          <span className="text-5xl mb-3 group-hover:rotate-12 transition-transform">
            📱
          </span>
          <span className="text-xl font-bold text-gray-800">
            잔여 횟수 조회
          </span>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/non-member")}
            className="group bg-stone-100 p-6 rounded-[2rem] hover:bg-stone-200 transition-all duration-300 flex flex-col items-center justify-center shadow-inner hover:shadow-md"
          >
            <span className="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">
              🎟️
            </span>
            <span className="text-lg font-bold text-stone-600">
              비회원 1회권
            </span>
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="group bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] hover:bg-emerald-100 hover:border-emerald-200 transition-all duration-300 flex flex-col items-center justify-center shadow-sm hover:shadow-md"
          >
            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">
              📝
            </span>
            <span className="text-lg font-bold text-emerald-700">회원가입</span>
          </button>
        </div>
      </div>

      <div className="mt-12 flex gap-8 text-stone-400 text-sm font-medium">
        <button
          onClick={() => router.push("/admin/login")}
          className="hover:text-stone-600 hover:underline underline-offset-4 transition-colors"
        >
          관리자 설정
        </button>
        <span className="w-px h-4 bg-stone-300"></span>
        <button
          onClick={() => router.push("/find-qr")}
          className="hover:text-stone-600 hover:underline underline-offset-4 transition-colors"
        >
          QR코드 찾기
        </button>
        <span className="w-px h-4 bg-stone-300"></span>
        <button
          onClick={() => router.push("/withdraw")}
          className="hover:text-red-500 hover:underline underline-offset-4 transition-colors"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
