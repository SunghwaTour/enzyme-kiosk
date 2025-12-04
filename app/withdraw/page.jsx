"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function WithdrawPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundMember, setFoundMember] = useState(null);

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length <= 11) setPhone(raw);
  };

  const findMember = async () => {
    if (phone.length < 10) {
      alert("전화번호를 정확히 입력해주세요.");
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

      if (data) {
        setFoundMember(data);
      } else {
        alert("가입되지 않은 전화번호입니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!password) {
      alert("2차 비밀번호를 입력해주세요.");
      return;
    }

    if (foundMember.second_password !== password) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!confirm(`정말로 '${foundMember.name}'님의 정보를 삭제하시겠습니까?`))
      return;

    setLoading(true);
    try {
      // 1. 삭제 전 로그 저장 (중요: 삭제되면 정보를 못 가져오므로 먼저 저장)
      await supabase.from("member_logs").insert({
        phone_number: foundMember.phone_number,
        name: foundMember.name,
        action_type: "탈퇴",
      });

      // 2. 회원 삭제
      await supabase.from("members").delete().eq("id", foundMember.id);

      alert("탈퇴가 완료되었습니다.");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
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
            <div className="mb-8 text-left">
              <label className="block text-xl font-bold text-gray-700 mb-2">
                2차 비밀번호 확인
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-2xl p-4 border-2 border-stone-300 rounded-xl"
                placeholder="가입 시 입력한 비밀번호"
              />
            </div>
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-red-600 text-white text-3xl font-bold py-6 rounded-2xl shadow-lg hover:bg-red-700 transition-colors"
            >
              {loading ? "처리중..." : "네, 탈퇴합니다"}
            </button>
            <button
              onClick={() => {
                setFoundMember(null);
                setPassword("");
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
