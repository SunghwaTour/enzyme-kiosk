"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AlertModal from "@/components/AlertModal";

export default function WithdrawPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  // 비밀번호 상태 제거됨
  const [loading, setLoading] = useState(false);
  const [foundMember, setFoundMember] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length <= 11) setPhone(raw);
  };

  const findMember = async () => {
    if (phone.length < 10) {
      setModal({
        isOpen: true,
        type: "error",
        title: "입력 오류",
        message: "전화번호를 정확히 입력해주세요.",
      });
      return;
    }
    setLoading(true);
    try {
      const formatted = phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
      const { data } = await supabase
        .from("members")
        .select("*")
        .eq("phone_number", formatted)
        .single();
      if (data) setFoundMember(data);
      else
        setModal({
          isOpen: true,
          type: "error",
          title: "조회 실패",
          message: "가입되지 않은 전화번호입니다.",
        });
    } catch {
      setModal({
        isOpen: true,
        type: "error",
        title: "오류",
        message: "오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 탈퇴 버튼 클릭 시 -> 비밀번호 확인 없이 바로 모달 띄우기
  const onWithdrawClick = () => {
    // 비밀번호 체크 로직 제거됨

    setModal({
      isOpen: true,
      type: "confirm",
      title: "정말 탈퇴하시겠습니까?",
      message: `'${foundMember.name}'님의 모든 정보가 삭제되며,\n되돌릴 수 없습니다.`,
    });
  };

  const processWithdraw = async () => {
    setLoading(true);
    try {
      await supabase
        .from("member_logs")
        .insert({
          phone_number: foundMember.phone_number,
          name: foundMember.name,
          action_type: "탈퇴",
        });
      await supabase.from("members").delete().eq("id", foundMember.id);

      setModal({
        isOpen: true,
        type: "alert",
        title: "탈퇴 완료",
        message: "정상적으로 탈퇴되었습니다.",
        onConfirm: () => router.push("/"),
      });
    } catch (err) {
      setModal({
        isOpen: true,
        type: "error",
        title: "오류",
        message: "삭제 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <AlertModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.type === "confirm" ? processWithdraw : modal.onConfirm}
        loading={loading}
      />

      <div className="w-full max-w-xl bg-white p-10 rounded-3xl shadow-xl border border-red-100">
        <h2 className="text-4xl font-bold text-red-600 mb-2 text-center">
          회원 탈퇴
        </h2>
        <p className="text-gray-500 text-center mb-8 text-lg">
          본인 확인을 위해 정보를 입력해주세요.
        </p>

        {!foundMember ? (
          <>
            <div className="mb-8">
              <label className="block text-xl font-bold text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full text-2xl p-4 border-2 border-stone-300 rounded-xl"
                placeholder="01012345678"
              />
            </div>
            <button
              onClick={findMember}
              disabled={loading}
              className="w-full bg-stone-700 text-white text-3xl font-bold py-6 rounded-2xl shadow-lg"
            >
              {loading ? "조회중..." : "내 정보 조회"}
            </button>
          </>
        ) : (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-red-50 p-6 rounded-2xl mb-6 border border-red-200">
              <p className="text-xl text-gray-600 mb-2">조회된 회원</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">
                {foundMember.name} 님
              </p>
              <p className="text-lg text-gray-500">
                {foundMember.phone_number}
              </p>
            </div>

            {/* 비밀번호 확인란 삭제됨 */}

            <button
              onClick={onWithdrawClick}
              disabled={loading}
              className="w-full bg-red-600 text-white text-3xl font-bold py-6 rounded-2xl shadow-lg hover:bg-red-700 transition-colors"
            >
              {loading ? "처리중..." : "네, 탈퇴합니다"}
            </button>
            <button
              onClick={() => {
                setFoundMember(null);
              }}
              className="w-full mt-4 py-3 text-lg text-gray-500 underline"
            >
              다른 번호로 조회하기
            </button>
          </div>
        )}
        {!foundMember && (
          <button
            onClick={() => router.back()}
            className="w-full mt-4 py-4 text-xl text-gray-500"
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
}
