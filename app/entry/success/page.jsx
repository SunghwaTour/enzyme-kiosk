"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const remaining = searchParams.get("remaining");

  // 현재 시간 상태
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // 1. 현재 날짜와 시간 포맷팅 (예: 2023년 12월 25일 월요일 오후 02:30)
    const now = new Date();
    const formatted = now.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    setCurrentDate(formatted);

    // 2. 3초 후 홈으로 자동 이동
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
      {/* 헤더 */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-md p-8 mb-8 text-center">
        <h1 className="text-5xl font-bold text-emerald-700">입실 완료</h1>
      </div>

      {/* 성공 메시지 카드 */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-md p-16 mb-8 text-center">
        <div className="text-8xl mb-6">✅</div>

        <p className="text-5xl font-bold text-gray-900 mb-4">{name}님</p>
        <p className="text-3xl text-gray-700 mb-10">입실이 완료되었습니다!</p>

        <div className="border-t-2 border-stone-200 pt-10 mt-6 space-y-4">
          {/* 현재 날짜 및 시간 */}
          <p className="text-2xl text-gray-500 font-medium">{currentDate}</p>

          {/* 잔여 횟수 강조 */}
          <div className="text-4xl font-bold text-emerald-600 bg-emerald-50 py-4 rounded-2xl mt-4">
            잔여 횟수 : {remaining}회
          </div>
        </div>
      </div>

      <p className="text-2xl text-gray-600 animate-pulse">
        3초 후 자동으로 돌아갑니다...
      </p>
    </div>
  );
}

export default function EntrySuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <p className="text-3xl text-emerald-600 font-bold">로딩중...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
