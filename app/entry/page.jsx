"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Scanner } from "@yudiel/react-qr-scanner";

function EntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // 'qr' | 'phone'

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUnregisteredPopup, setShowUnregisteredPopup] = useState(false);
  const [isScanned, setIsScanned] = useState(false);

  const handleNumberClick = (num) => {
    if (phoneNumber.length < 11) setPhoneNumber(phoneNumber + num);
  };
  const handle010Click = () => setPhoneNumber("010");
  const handleClear = () => setPhoneNumber(phoneNumber.slice(0, -1));

  // 공통 입실 처리 함수
  const processEntry = async (member) => {
    try {
      // 1. 회원의 사용 가능한 모든 이용권 조회 (오래된 순)
      const { data: passes } = await supabase
        .from("purchase_history")
        .select("*")
        .eq("member_id", member.id)
        .eq("is_active", true)
        .gt("remaining_count", 0)
        .order("purchase_date", { ascending: true });

      if (!passes || passes.length === 0) {
        setError("사용 가능한 이용권이 없습니다.");
        setLoading(false);
        if (mode === "qr") setTimeout(() => setIsScanned(false), 3000);
        return;
      }

      // 2. 가장 오래된 이용권 사용
      const pass = passes[0];
      const newRemaining = pass.remaining_count - 1;

      // 3. DB 업데이트 (차감)
      await supabase
        .from("purchase_history")
        .update({
          remaining_count: newRemaining,
          last_used_date: new Date().toISOString(),
          is_active: newRemaining > 0,
        })
        .eq("id", pass.id);

      // 4. 입실 기록 저장
      await supabase.from("entry_logs").insert({
        member_id: member.id,
        phone_number: member.phone_number,
        name: member.name,
        pass_type: pass.pass_type,
      });

      // 🚨 핵심 수정: '이번 이용권 잔여'가 아닌 '회원의 총 잔여 횟수' 계산
      // (방금 차감된 pass의 newRemaining + 나머지 다른 이용권들의 합)
      const totalRemaining = passes.reduce((sum, p) => {
        if (p.id === pass.id) {
          return sum + newRemaining;
        }
        return sum + p.remaining_count;
      }, 0);

      // 5. 성공 페이지로 이동 (총 잔여 횟수 전달)
      router.push(
        `/entry/success?name=${encodeURIComponent(
          member.name
        )}&remaining=${totalRemaining}`
      );
    } catch (err) {
      console.error(err);
      setError("시스템 오류가 발생했습니다.");
      setLoading(false);
      if (mode === "qr") setTimeout(() => setIsScanned(false), 3000);
    }
  };

  // 1. [QR 스캔] 핸들러
  const handleQrScan = async (detectedCodes) => {
    if (detectedCodes?.[0]?.rawValue && !isScanned && !loading) {
      const rawValue = detectedCodes[0].rawValue;

      // URL에서 UUID 추출
      let qrCodeValue = rawValue;
      if (rawValue.includes("/my-qr/")) {
        qrCodeValue = rawValue.split("/my-qr/")[1];
      }

      setIsScanned(true);
      setLoading(true);
      setError("");

      try {
        const { data: member } = await supabase
          .from("members")
          .select("*")
          .eq("qr_code", qrCodeValue)
          .single();

        if (!member) {
          setError("유효하지 않은 QR 코드입니다.");
          setLoading(false);
          setTimeout(() => setIsScanned(false), 3000);
          return;
        }

        await processEntry(member);
      } catch (err) {
        console.error(err);
        setLoading(false);
        setTimeout(() => setIsScanned(false), 3000);
      }
    }
  };

  // 2. [전화번호 입력] 핸들러
  const handlePhoneEntry = async () => {
    if (phoneNumber.length < 10) {
      setError("전화번호를 정확히 입력해주세요");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const formatted = phoneNumber.replace(
        /(\d{3})(\d{4})(\d{4})/,
        "$1-$2-$3"
      );

      const { data: member } = await supabase
        .from("members")
        .select("*")
        .eq("phone_number", formatted)
        .single();

      if (!member) {
        setShowUnregisteredPopup(true);
        setLoading(false);
        return;
      }

      await processEntry(member);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col items-center justify-center p-3 overflow-hidden">
      {/* 미등록 회원 팝업 */}
      {showUnregisteredPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-3xl p-10 max-w-2xl w-full shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 whitespace-pre-line">
              등록되지 않은 번호입니다.{"\n"}회원가입을 하시겠습니까?
            </h2>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => router.push("/signup")}
                className="flex-1 bg-emerald-600 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg"
              >
                회원가입
              </button>
              <button
                onClick={() => {
                  setShowUnregisteredPopup(false);
                  setPhoneNumber("");
                }}
                className="flex-1 bg-stone-200 text-gray-700 text-2xl font-bold py-6 rounded-2xl"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-4 text-center border border-stone-200">
        <h1 className="text-3xl font-bold text-gray-900">
          {mode === "qr" ? "QR 코드를 비춰주세요" : "전화번호 입력"}
        </h1>
      </div>

      {/* 메인 컨텐츠 */}
      {mode === "qr" ? (
        <div className="w-full max-w-xl aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500 relative">
          <Scanner
            onScan={handleQrScan}
            constraints={{ facingMode: "user" }}
            components={{ audio: false, finder: false }}
            styles={{
              container: { width: "100%", height: "100%" },
              video: { width: "100%", height: "100%", objectFit: "cover" },
            }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
              <p className="text-white text-2xl font-bold animate-pulse">
                확인 중...
              </p>
            </div>
          )}
          {error && (
            <div className="absolute bottom-10 left-0 right-0 text-center">
              <span className="bg-red-600 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                {error}
              </span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="w-full max-w-xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-4 text-center border border-stone-200">
            <div className="bg-stone-50 border-2 border-stone-300 p-4 rounded-xl mb-4">
              <p className="text-4xl font-mono text-gray-900 tracking-widest min-h-[3rem] flex items-center justify-center">
                {phoneNumber || "010-0000-0000"}
              </p>
            </div>
            {error && (
              <p className="text-lg text-red-600 font-bold animate-bounce">
                {error}
              </p>
            )}
          </div>
          <div className="w-full max-w-xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-stone-200">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  className="bg-white hover:bg-stone-50 text-gray-800 text-3xl font-bold py-4 rounded-xl border-b-4 border-stone-200 active:border-b-0 active:translate-y-1 transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handle010Click}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold py-4 rounded-xl border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all"
              >
                010
              </button>
              <button
                onClick={() => handleNumberClick("0")}
                className="bg-white hover:bg-stone-50 text-gray-800 text-3xl font-bold py-4 rounded-xl border-b-4 border-stone-200 active:border-b-0 active:translate-y-1 transition-all"
              >
                0
              </button>
              <button
                onClick={handleClear}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xl font-bold py-4 rounded-xl border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all"
              >
                ←
              </button>
            </div>
          </div>
        </>
      )}

      {/* 하단 버튼 */}
      <div className="w-full max-w-xl flex gap-3 mt-6">
        <button
          onClick={() => router.push("/")}
          className="flex-1 bg-stone-300 hover:bg-stone-400 text-gray-800 text-2xl font-bold py-4 rounded-xl shadow-md active:scale-95 transition-all"
        >
          처음으로
        </button>
        {mode !== "qr" && (
          <button
            onClick={handlePhoneEntry}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-2xl font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
            disabled={loading || phoneNumber.length < 10}
          >
            {loading ? "처리중..." : "입실하기"}
          </button>
        )}
      </div>
    </div>
  );
}

// Suspense로 감싸서 useSearchParams 에러 방지
export default function EntryPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-stone-50">
          loading...
        </div>
      }
    >
      <EntryContent />
    </Suspense>
  );
}
