"use client";

import { useRouter } from "next/navigation";

export default function NonMemberPaymentPage() {
  const router = useRouter();

  // 🏦 관리자 계좌 정보
  const BANK_INFO = {
    bank: "카카오뱅크",
    account: "3333-00-1234567",
    owner: "내 몸에 효소욕", // 예금주
    price: 40000, // 1회권 가격
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-emerald-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">비회원 1회 이용권</h1>
          <p className="text-emerald-100 text-sm mt-1">
            아래 계좌로 이체해 주세요
          </p>
        </div>

        <div className="p-8">
          {/* 1. 결제 금액 */}
          <div className="text-center mb-8 bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <p className="text-stone-500 font-bold mb-2">결제하실 금액</p>
            <p className="text-4xl font-extrabold text-emerald-600">
              {BANK_INFO.price.toLocaleString()}원
            </p>
          </div>

          {/* 2. 계좌 정보 (카드 형태) */}
          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <span className="text-stone-500 font-bold">은행명</span>
              <span className="text-xl font-bold text-gray-800">
                {BANK_INFO.bank}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <span className="text-stone-500 font-bold">계좌번호</span>
              <span className="text-xl font-bold text-gray-800 tracking-wide">
                {BANK_INFO.account}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <span className="text-stone-500 font-bold">예금주</span>
              <span className="text-xl font-bold text-gray-800">
                {BANK_INFO.owner}
              </span>
            </div>
          </div>

          {/* 3. 안내 문구 */}
          <div className="bg-yellow-50 p-4 rounded-xl mb-8 text-center border border-yellow-100">
            <p className="text-yellow-700 font-bold text-sm flex items-center justify-center gap-2">
              <span>🔔</span> 입금 내역을 관리자에게 보여주세요!
            </p>
          </div>

          {/* 홈으로 버튼 */}
          <button
            onClick={() => router.push("/")}
            className="w-full bg-stone-700 hover:bg-stone-800 text-white text-xl font-bold py-5 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
