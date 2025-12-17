"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
// ✅ 여기가 범인! 에러 나던 줄을 지우고 올바른 파일로 연결했습니다.
import { supabase } from "@/lib/supabase";
import TutorialOverlay from "@/components/TutorialOverlay";
import AlertModal from "@/components/AlertModal";

export default function EntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // 모달 상태
  const [modal, setModal] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const processEntry = async (qrCode) => {
    if (loading) return;
    setLoading(true);

    try {
      console.log("입장 QR 코드:", qrCode);

      const { data: member } = await supabase
        .from("members")
        .select("*")
        .eq("qr_code", qrCode)
        .single();

      if (!member) {
        setModal({
          isOpen: true,
          type: "error",
          title: "입장 실패",
          message: "등록되지 않은 QR코드입니다.",
        });
        setLoading(false);
        return;
      }

      console.log("입장 처리 시작:", member);

      // 예약 확인
      const { data: reservation } = await supabase
        .from("reservations")
        .select("*")
        .eq("member_id", member.id)
        .eq("status", "pending")
        .single();

      // (A) 예약이 있다면?
      if (reservation) {
        await supabase
          .from("reservations")
          .update({ status: "completed" })
          .eq("id", reservation.id);
        await supabase
          .from("rooms")
          .update({ status: "occupied", current_users: 1 })
          .eq("id", reservation.room_id);

        setModal({
          isOpen: true,
          type: "alert",
          title: "입실 완료",
          message: `${member.name}님,\n예약된 방으로 입실되었습니다.`,
          onConfirm: () => router.push("/"),
        });
        setLoading(false);
        return;
      }

      // (B) 예약 없음 -> 바로 차감 및 입장
      const { data: passes } = await supabase
        .from("purchase_history")
        .select("*")
        .eq("member_id", member.id)
        .gt("remaining_count", 0)
        .order("purchase_date", { ascending: true });

      if (!passes || passes.length === 0) {
        setModal({
          isOpen: true,
          type: "error",
          title: "입장 불가",
          message: "사용 가능한 이용권이 없습니다.",
        });
        setLoading(false);
        return;
      }

      const targetPass = passes[0];

      const { error: updateError } = await supabase
        .from("purchase_history")
        .update({
          remaining_count: targetPass.remaining_count - 1,
          last_used_date: new Date().toISOString(),
        })
        .eq("id", targetPass.id);

      if (updateError) throw updateError;

      await supabase.from("entry_logs").insert({
        member_id: member.id,
        name: member.name,
        phone_number: member.phone_number,
        pass_type: targetPass.pass_type,
      });

      setModal({
        isOpen: true,
        type: "alert",
        title: "입실 완료",
        message: `${member.name}님 환영합니다!\n\n${
          targetPass.pass_type
        } 1회 차감되었습니다.\n(잔여: ${targetPass.remaining_count - 1}회)`,
        onConfirm: () => router.push("/"),
      });
    } catch (err) {
      console.error("에러 발생:", err);
      setModal({
        isOpen: true,
        type: "error",
        title: "오류",
        message: "시스템 오류가 발생했습니다.",
      });
      setLoading(false);
    }
  };

  const handleScan = (detectedCodes) => {
    if (detectedCodes?.[0]?.rawValue) {
      let code = detectedCodes[0].rawValue;
      if (code.includes("/my-qr/")) {
        code = code.split("/my-qr/")[1];
      }
      processEntry(code);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8 relative">
      <TutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        page="entry"
      />
      <AlertModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
      />

      <button
        onClick={() => setShowTutorial(true)}
        className="absolute top-8 right-8 bg-white p-4 rounded-full shadow-lg border-2 border-stone-200 text-stone-600 hover:bg-stone-100 hover:scale-110 transition-all z-10"
      >
        <span className="text-2xl font-bold">❓</span>
      </button>

      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-bold mb-8">입장하기</h1>
        <p className="text-2xl mb-4 text-gray-600">QR 코드를 비춰주세요</p>
        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500 aspect-square relative">
          <Scanner
            onScan={handleScan}
            constraints={{ facingMode: "user" }}
            components={{ audio: false, finder: false }}
            styles={{ container: { width: "100%", height: "100%" } }}
          />
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
              확인 중...
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
    </div>
  );
}
