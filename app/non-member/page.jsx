"use client";

import { useRouter } from "next/navigation";

export default function NonMemberPage() {
  const router = useRouter();

  const handleRegister = () => {
    // 🚨 수정됨: 기존 회원이 아닌 신규 가입이므로 /signup 으로 이동
    router.push("/signup");
  };

  const handleOneTimePass = () => {
    // 1회권 결제 페이지로 이동 (비회원 1회권)
    router.push("/non-member/payment");
  };

  return (
    <div className="h-screen bg-stone-50 flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-md p-12 mb-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">비회원 안내</h2>
        <p className="text-3xl text-gray-800 mb-4">비회원일 경우</p>
        <p className="text-3xl text-gray-800 mb-12">
          1회권밖에 사용이 불가합니다.
        </p>
        <p className="text-2xl text-emerald-700 font-semibold">
          회원가입을 진행하시겠습니까?
        </p>
      </div>

      <div className="w-full max-w-2xl flex gap-8">
        <button
          onClick={handleRegister}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-3xl font-bold py-16 px-8 rounded-3xl transition-all active:scale-95 shadow-lg"
        >
          예<br />
          <span className="text-xl font-normal">(회원가입 후 이용권 구매)</span>
        </button>

        <button
          onClick={handleOneTimePass}
          className="flex-1 bg-white border-2 border-stone-300 hover:border-emerald-600 hover:bg-emerald-50 text-gray-900 text-3xl font-bold py-16 px-8 rounded-3xl transition-all active:scale-95 shadow-md"
        >
          아니요
          <br />
          <span className="text-xl font-normal">(1회권 결제)</span>
        </button>
      </div>

      <button
        onClick={() => router.push("/")}
        className="mt-8 bg-stone-300 hover:bg-stone-400 text-gray-900 text-xl font-semibold py-4 px-12 rounded-2xl transition-all active:scale-95 shadow-md"
      >
        처음으로
      </button>
    </div>
  );
}
