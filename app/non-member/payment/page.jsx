"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NonMemberPaymentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // 🏦 관리자 계좌 정보
  const BANK_INFO = {
    bank: "카카오뱅크",
    account: "3333-00-1234567",
    owner: "바나나 스터디룸",
    price: 40000,
  };

  // 전화번호 입력 핸들러 (숫자만 입력)
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length <= 11) {
      setPhone(raw);
    }
  };

  // 전화번호 하이픈(-) 자동 포맷팅
  const formatPhoneNumber = (str) => {
    if (str.length < 4) return str;
    if (str.length < 8) return `${str.slice(0, 3)}-${str.slice(3)}`;
    return `${str.slice(0, 3)}-${str.slice(3, 7)}-${str.slice(7)}`;
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        {/* 헤더 */}
        <div className="bg-emerald-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">비회원 1회 이용권</h1>
          <p className="text-emerald-100 text-sm mt-1">
            계좌이체 후 정보를 입력해주세요
          </p>
        </div>

        <div className="p-8">
          {/* 1. 결제 금액 & 계좌 정보 */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8 text-center">
            <p className="text-stone-500 font-bold mb-2">결제하실 금액</p>
            <p className="text-4xl font-extrabold text-emerald-600 mb-6">
              {BANK_INFO.price.toLocaleString()}원
            </p>

            <div className="text-left space-y-2 text-stone-600 bg-white p-4 rounded-xl border border-stone-200 text-sm">
              <div className="flex justify-between">
                <span>은행</span>
                <span className="font-bold">{BANK_INFO.bank}</span>
              </div>
              <div className="flex justify-between">
                <span>계좌</span>
                <span className="font-bold tracking-wide">
                  {BANK_INFO.account}
                </span>
              </div>
              <div className="flex justify-between">
                <span>예금주</span>
                <span className="font-bold">{BANK_INFO.owner}</span>
              </div>
            </div>
          </div>

          {/* 2. 정보 입력 폼 */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-1">
                입금자명
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full p-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 outline-none text-lg placeholder:text-stone-300 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-1">
                전화번호
              </label>
              <input
                type="tel"
                value={formatPhoneNumber(phone)}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                className="w-full p-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 outline-none text-lg placeholder:text-stone-300 transition-colors"
              />
            </div>
          </div>

          {/* 3. ✨ 요청하신 문구 (입력칸 바로 밑) */}
          <div className="bg-yellow-50 p-4 rounded-xl mb-8 text-center border border-yellow-100">
            <p className="text-yellow-700 font-bold text-lg animate-pulse">
              🔔 입금 내역을 관리자에게 보여주세요!
            </p>
          </div>

          {/* 4. 하단 버튼 */}
          <button
            onClick={() => router.push("/")}
            className="w-full bg-stone-700 hover:bg-stone-800 text-white text-xl font-bold py-5 rounded-2xl shadow-lg active:scale-95 transition-all mb-4"
          >
            홈으로 돌아가기
          </button>

          <button
            onClick={() => router.back()}
            className="w-full bg-stone-200 hover:bg-stone-300 text-stone-600 text-lg font-bold py-4 rounded-2xl active:scale-95 transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
