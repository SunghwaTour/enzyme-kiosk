"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Scanner } from "@yudiel/react-qr-scanner";
import AlertModal from "@/components/AlertModal";

export default function CheckPage() {
  const router = useRouter();
  const [step, setStep] = useState("scan");
  const [info, setInfo] = useState(null); // { member, passes }
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  // 어떤 이용권의 상세 기록을 열었는지 관리 (ID 저장)
  const [openPassId, setOpenPassId] = useState(null);

  // 총 잔여 횟수 계산
  const calculateTotal = (passes) => {
    return passes.reduce(
      (sum, pass) => (pass.is_active ? sum + pass.remaining_count : sum),
      0
    );
  };

  // ✨ 핵심 로직: 로그를 이용권에 분배(Allocation)하는 함수
  const allocateLogsToPasses = (passes, logs) => {
    // 1. 계산을 위해 시간순(과거->미래) 정렬
    // (소모는 옛날 이용권부터, 옛날 기록부터 이루어진다고 가정)
    const sortedPasses = [...passes].sort(
      (a, b) => new Date(a.purchase_date) - new Date(b.purchase_date)
    );
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.entry_time) - new Date(b.entry_time)
    );

    // 각 이용권에 기록을 담을 바구니 준비
    sortedPasses.forEach((p) => {
      p.allocatedLogs = [];
      p.usedTracker = 0; // 할당 로직용 임시 카운터
    });

    // 2. 로그를 하나씩 꺼내서 적절한 이용권에 넣기
    sortedLogs.forEach((log) => {
      // 조건: 같은 종류(pass_type)이고, 이용권 구매일보다 나중에 찍힌 로그여야 함
      // 그리고 아직 횟수가 남은 이용권이어야 함 (FIFO 방식)
      const targetPass = sortedPasses.find(
        (p) =>
          p.pass_type === log.pass_type &&
          new Date(p.purchase_date) <= new Date(log.entry_time) &&
          p.usedTracker < p.purchase_count
      );

      if (targetPass) {
        targetPass.usedTracker++; // 사용 횟수 증가
        const remainingAtSnapshot =
          targetPass.purchase_count - targetPass.usedTracker; // 당시 잔여량 계산

        targetPass.allocatedLogs.push({
          ...log,
          remainingAtSnapshot, // 그 시점의 잔여 횟수 저장
        });
      }
    });

    // 3. 화면 표시를 위해 다시 최신순(미래->과거) 정렬해서 반환
    return sortedPasses
      .map((p) => ({
        ...p,
        // 로그도 최신순으로 뒤집기
        allocatedLogs: p.allocatedLogs.sort(
          (a, b) => new Date(b.entry_time) - new Date(a.entry_time)
        ),
      }))
      .sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
  };

  const handleScan = async (detectedCodes) => {
    if (detectedCodes?.[0]?.rawValue && !loading) {
      const rawValue = detectedCodes[0].rawValue;
      let qrValue = rawValue;
      if (rawValue.includes("/my-qr/")) {
        qrValue = rawValue.split("/my-qr/")[1];
      }

      setLoading(true);
      try {
        const { data: member } = await supabase
          .from("members")
          .select("*")
          .eq("qr_code", qrValue)
          .single();

        if (member) {
          // 이용권 조회
          const { data: passes } = await supabase
            .from("purchase_history")
            .select("*")
            .eq("member_id", member.id);

          // 로그 조회 (전체 가져오기)
          const { data: logs } = await supabase
            .from("entry_logs")
            .select("*")
            .eq("member_id", member.id);

          // ✨ 데이터 가공 (로그 분배)
          const processedPasses = allocateLogsToPasses(
            passes || [],
            logs || []
          );

          setInfo({ member, passes: processedPasses });
          setStep("result");
        } else {
          setModal({
            isOpen: true,
            type: "error",
            title: "조회 실패",
            message: "등록되지 않은 회원 QR입니다.",
          });
        }
      } catch (err) {
        console.error(err);
        setModal({
          isOpen: true,
          type: "error",
          title: "오류",
          message: "데이터 조회 중 오류가 발생했습니다.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleDetails = (passId) => {
    setOpenPassId(openPassId === passId ? null : passId);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <AlertModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      {step === "scan" && (
        <div className="w-full max-w-lg text-center">
          <h1 className="text-4xl font-bold mb-8">잔여 횟수 조회</h1>
          <p className="text-2xl mb-4 text-gray-600">QR 코드를 비춰주세요</p>
          <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-500 aspect-square relative">
            <Scanner
              onScan={handleScan}
              constraints={{ facingMode: "user" }}
              components={{ audio: false, finder: false }}
              styles={{ container: { width: "100%", height: "100%" } }}
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
        <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-stone-200 my-8 animate-in slide-in-from-bottom-5 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {info.member.name}님의 현황
            </h2>
            <p className="text-xl text-gray-500">{info.member.phone_number}</p>
          </div>

          <div className="bg-[#4A5D4F] rounded-2xl p-6 text-center mb-8 text-white shadow-lg">
            <p className="text-lg opacity-80 mb-1">총 잔여 횟수</p>
            <p className="text-5xl font-extrabold">
              {calculateTotal(info.passes)}회
            </p>
          </div>

          {/* 이용권 목록 (카드형 리스트) */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar mb-8">
            {info.passes?.length === 0 ? (
              <p className="text-center text-2xl text-gray-400 py-10">
                구매 이력이 없습니다
              </p>
            ) : (
              info.passes.map((pass) => {
                const isExhausted = pass.remaining_count === 0;
                const isOpen = openPassId === pass.id;

                return (
                  <div
                    key={pass.id}
                    className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                      isExhausted
                        ? "border-stone-200 bg-stone-50 opacity-80"
                        : "border-emerald-500 bg-emerald-50"
                    }`}
                  >
                    {/* 카드 헤더 (클릭 시 상세 열림) */}
                    <div
                      className="p-5 flex flex-col gap-1 cursor-pointer"
                      onClick={() => toggleDetails(pass.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          {pass.pass_type}
                          {/* 화살표 아이콘 */}
                          <span
                            className={`text-sm transition-transform duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          >
                            ▼
                          </span>
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            isExhausted ? "text-stone-400" : "text-emerald-600"
                          }`}
                        >
                          {pass.remaining_count}/{pass.purchase_count}회
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-1">
                        <div className="text-xs text-stone-500">
                          구매일:{" "}
                          {new Date(pass.purchase_date).toLocaleDateString()}
                        </div>
                        {isExhausted && pass.last_used_date && (
                          <div className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                            {new Date(pass.last_used_date).toLocaleDateString()}{" "}
                            소진됨
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ✨ 상세 기록 (슬라이드 다운) - 해당 이용권의 기록만 표시 */}
                    {isOpen && (
                      <div className="bg-white border-t border-stone-200 animate-in slide-in-from-top-2">
                        <div className="p-4 bg-stone-50/50">
                          <p className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">
                            이 이용권 사용 기록
                          </p>
                          {pass.allocatedLogs.length === 0 ? (
                            <p className="text-center text-stone-400 text-sm py-4">
                              사용 기록이 없습니다.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {pass.allocatedLogs.map((log) => (
                                <div
                                  key={log.id}
                                  className="flex justify-between items-center p-3 bg-white border border-stone-100 rounded-lg shadow-sm text-sm"
                                >
                                  <span className="text-stone-600 font-mono">
                                    {new Date(
                                      log.entry_time
                                    ).toLocaleDateString()}{" "}
                                    <span className="text-xs text-stone-400">
                                      {new Date(
                                        log.entry_time
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </span>
                                  <span className="font-bold text-emerald-600">
                                    {/* 이 로그 시점의 잔여량 */}
                                    {log.remainingAtSnapshot}회 남음
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full bg-stone-700 hover:bg-stone-800 text-white text-2xl font-bold py-5 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            확인 (메인으로)
          </button>
        </div>
      )}
    </div>
  );
}
