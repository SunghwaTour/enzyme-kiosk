"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function CheckPage() {
  const router = useRouter();
  const [step, setStep] = useState("scan");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✨ 총 잔여 횟수 계산 함수
  const calculateTotal = (passes) => {
    return passes.reduce((sum, pass) => {
      // 활성화된(is_active) 이용권의 남은 횟수만 합산
      return pass.is_active ? sum + pass.remaining_count : sum;
    }, 0);
  };

  const handleScan = async (detectedCodes) => {
    if (detectedCodes?.[0]?.rawValue && !loading) {
      const rawValue = detectedCodes[0].rawValue;

      let qrValue = rawValue;
      if (rawValue.includes("/my-qr/")) {
        qrValue = rawValue.split("/my-qr/")[1];
      }

      setLoading(true);
      const { data: member } = await supabase
        .from("members")
        .select("*")
        .eq("qr_code", qrValue)
        .single();

      if (member) {
        const { data: passes } = await supabase
          .from("purchase_history")
          .select("*")
          .eq("member_id", member.id)
          .order("purchase_date", { ascending: false }); // 최신순 정렬

        setInfo({ member, passes });
        setStep("result");
      } else {
        alert("등록되지 않은 회원 QR입니다.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      {step === "scan" && (
        <div className="w-full max-w-lg text-center">
          <h1 className="text-4xl font-bold mb-8">잔여 횟수 조회</h1>
          <p className="text-2xl mb-4 text-gray-600">QR 코드를 비춰주세요</p>
          <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-500 aspect-square relative">
            <Scanner
              onScan={handleScan}
              constraints={{ facingMode: "user" }}
              components={{ audio: false, finder: false }}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { width: "100%", height: "100%", objectFit: "cover" },
              }}
            />
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                조회 중...
              </div>
            )}
          </div>
          <button
            onClick={() => router.back()}
            className="mt-8 px-8 py-4 bg-stone-300 rounded-xl text-xl font-bold"
          >
            뒤로가기
          </button>
        </div>
      )}

      {step === "result" && info && (
        <div className="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-xl border border-stone-200">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {info.member.name}님의 현황
            </h2>
            <p className="text-xl text-gray-500">{info.member.phone_number}</p>
          </div>

          {/* ✨ 총 잔여 횟수 강조 영역 */}
          <div className="bg-[#4A5D4F] rounded-2xl p-6 text-center mb-8 text-white shadow-lg transform scale-105">
            <p className="text-lg opacity-80 mb-1">총 잔여 횟수</p>
            <p className="text-5xl font-extrabold">
              {calculateTotal(info.passes)}회
            </p>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {info.passes?.length === 0 ? (
              <p className="text-center text-2xl text-gray-400 py-10">
                이용권 내역이 없습니다.
              </p>
            ) : (
              info.passes.map((pass) => (
                <div
                  key={pass.id}
                  className={`p-5 rounded-xl border-2 flex justify-between items-center ${
                    pass.remaining_count > 0
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-gray-50 opacity-50"
                  }`}
                >
                  <div>
                    <div className="text-xl font-bold text-gray-800">
                      {pass.pass_type}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(pass.purchase_date).toLocaleDateString()} 구매
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      pass.remaining_count > 0
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  >
                    {pass.remaining_count}회
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full mt-8 bg-stone-700 text-white text-2xl font-bold py-5 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            확인 (메인으로)
          </button>
        </div>
      )}
    </div>
  );
}
