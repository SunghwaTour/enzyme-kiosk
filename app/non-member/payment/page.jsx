"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AlertModal from "@/components/AlertModal"; // ✨ 모달 컴포넌트 불러오기

export default function NonMemberPaymentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // ✨ 공통 모달 상태 하나로 통합
  const [modal, setModal] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const BANK_INFO = {
    bank: "카카오뱅크",
    account: "3333-00-1234567",
    owner: "내몸에 효소욕(가명)",
    price: 40000,
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length <= 11) setPhone(raw);
  };

  const formatPhoneNumber = (str) => {
    if (str.length < 4) return str;
    if (str.length < 8) return `${str.slice(0, 3)}-${str.slice(3)}`;
    return `${str.slice(0, 3)}-${str.slice(3, 7)}-${str.slice(7)}`;
  };

  // 1단계: 검증 (alert 대신 setModal 사용)
  const handlePreCheck = async () => {
    if (!name.trim()) {
      setModal({
        isOpen: true,
        type: "error",
        title: "입력 오류",
        message: "입금자 성함을 입력해주세요.",
      });
      return;
    }
    if (phone.length < 10) {
      setModal({
        isOpen: true,
        type: "error",
        title: "입력 오류",
        message: "전화번호를 올바르게 입력해주세요.",
      });
      return;
    }

    setLoading(true);
    const formattedPhone = formatPhoneNumber(phone);

    try {
      // 중복 체크 로직
      const { data: member } = await supabase
        .from("members")
        .select("name")
        .eq("phone_number", formattedPhone)
        .maybeSingle();
      if (member && member.name !== name) {
        setModal({
          isOpen: true,
          type: "error",
          title: "정보 불일치",
          message:
            "이미 등록된 전화번호이나\n이름이 일치하지 않습니다.\n\n🚨 직원에게 문의하세요.",
        });
        setLoading(false);
        return;
      }

      const { data: lastHistory } = await supabase
        .from("purchase_history")
        .select("name")
        .eq("phone_number", formattedPhone)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastHistory && lastHistory.name !== name) {
        setModal({
          isOpen: true,
          type: "error",
          title: "정보 불일치",
          message:
            "이전에 사용된 전화번호이나\n이름이 일치하지 않습니다.\n\n🚨 직원에게 문의하세요.",
        });
        setLoading(false);
        return;
      }

      // 검증 통과 -> 확인 모달 띄우기
      setModal({
        isOpen: true,
        type: "confirm",
        title: "입금 확인",
        message: `${name}님,\n입금을 완료하셨습니까?\n\n확인을 누르면 정보가 저장되고\n홈으로 이동합니다.`,
      });
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        type: "error",
        title: "오류",
        message: "시스템 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 2단계: 실제 저장 (모달에서 확인 눌렀을 때 실행)
  const handleFinalSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("purchase_history").insert({
        name: name,
        phone_number: formatPhoneNumber(phone),
        pass_type: "비회원 1회권",
        purchase_count: 1,
        remaining_count: 0,
        is_active: false,
      });

      if (error) throw error;

      // 성공 알림 후 홈으로
      setModal({
        isOpen: true,
        type: "alert",
        title: "저장 완료",
        message: "성공적으로 저장되었습니다.\n홈으로 이동합니다.",
        onConfirm: () => router.push("/"),
      });
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        type: "error",
        title: "저장 실패",
        message: "저장 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 relative">
      {/* ✨ 공통 모달 컴포넌트 사용 */}
      <AlertModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.type === "confirm" ? handleFinalSave : modal.onConfirm}
        loading={loading}
      />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        <div className="bg-emerald-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">비회원 1회 이용권</h1>
          <p className="text-emerald-100 text-sm mt-1">
            계좌이체 후 정보를 입력해주세요
          </p>
        </div>

        <div className="p-8">
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
                className="w-full p-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 outline-none text-lg transition-colors"
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
                className="w-full p-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 outline-none text-lg transition-colors"
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl mb-8 text-center border border-yellow-100">
            <p className="text-yellow-700 font-bold text-lg animate-pulse">
              🔔 입금 내역을 관리자에게 보여주세요!
            </p>
          </div>

          <button
            onClick={handlePreCheck}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold py-5 rounded-2xl shadow-lg active:scale-95 transition-all mb-4 disabled:opacity-50"
          >
            {loading ? "확인 중..." : "확인 (저장 후 홈으로)"}
          </button>

          <button
            onClick={() => router.push("/")}
            disabled={loading}
            className="w-full bg-stone-200 hover:bg-stone-300 text-stone-600 text-lg font-bold py-4 rounded-2xl active:scale-95 transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
