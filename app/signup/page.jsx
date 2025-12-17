"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import AlertModal from "@/components/AlertModal";

const PASS_TYPES = [
  { name: "1회권 (첫 체험)", count: 1, price: 35000 },
  { name: "1회권", count: 1, price: 40000 },
  { name: "12회권", count: 12, price: 400000 },
  { name: "26회권", count: 26, price: 800000 },
  { name: "50회권", count: 50, price: 1200000 },
  { name: "70회권", count: 70, price: 1600000 },
  { name: "100회권", count: 100, price: 2000000 },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPass, setSelectedPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ticketUrl, setTicketUrl] = useState("");
  const [origin, setOrigin] = useState("");

  const [modal, setModal] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  // ✨ 자동 하이픈 생성 로직 적용
  const handlePhoneChange = (e) => {
    // 1. 숫자만 추출
    const raw = e.target.value.replace(/[^0-9]/g, "");

    // 2. 길이에 따라 하이픈 추가
    let formatted = raw;
    if (raw.length < 4) {
      formatted = raw;
    } else if (raw.length < 8) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length <= 11) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
    }

    // 3. 최대 길이 제한 (13자리: 010-1234-5678)
    if (formatted.length > 13) return;

    setPhone(formatted);
  };

  const goToPassSelection = async () => {
    // 하이픈 제거 후 길이 체크
    const rawPhone = phone.replace(/-/g, "");

    if (!name || rawPhone.length < 10) {
      setModal({
        isOpen: true,
        type: "error",
        title: "입력 오류",
        message: "이름과 전화번호를 정확히 입력해주세요.",
      });
      return;
    }

    // phone 상태값은 이미 "010-1234-5678" 형태이므로 그대로 조회에 사용
    const { data } = await supabase
      .from("members")
      .select("id")
      .eq("phone_number", phone)
      .single();
    if (data) {
      setModal({
        isOpen: true,
        type: "error",
        title: "가입 불가",
        message: "이미 가입된 전화번호입니다.",
      });
      return;
    }
    setStep(2);
  };

  const handleComplete = async () => {
    if (!selectedPass) return;
    setLoading(true);
    let newMemberId = null;

    try {
      // phone 상태값이 이미 포맷팅 되어있으므로 그대로 사용
      const formattedPhone = phone;
      const uniqueQrCode = crypto.randomUUID();

      const { data: newMember, error: memberError } = await supabase
        .from("members")
        .insert({
          name,
          phone_number: formattedPhone,
          qr_code: uniqueQrCode,
        })
        .select()
        .single();

      if (memberError) throw memberError;
      newMemberId = newMember.id;

      const { error: purchaseError } = await supabase
        .from("purchase_history")
        .insert({
          member_id: newMember.id,
          phone_number: formattedPhone,
          name: name,
          pass_type: selectedPass.name,
          purchase_count: selectedPass.count,
          remaining_count: selectedPass.count,
          is_active: true,
        });

      if (purchaseError) throw purchaseError;

      const url = `${origin}/my-qr/${uniqueQrCode}`;
      setTicketUrl(url);
      setStep(3);
    } catch (err) {
      console.error(err);
      if (newMemberId)
        await supabase.from("members").delete().eq("id", newMemberId);
      setModal({
        isOpen: true,
        type: "error",
        title: "오류",
        message: "가입 처리 중 오류가 발생했습니다.",
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
      />

      {step === 1 && (
        <div className="w-full max-w-xl bg-white p-10 rounded-3xl shadow-xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            회원가입
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                이름
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-2xl p-4 border-2 border-stone-300 rounded-xl"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full text-2xl p-4 border-2 border-stone-300 rounded-xl"
                placeholder="010-1234-5678"
              />
            </div>
          </div>
          <button
            onClick={goToPassSelection}
            className="w-full mt-10 bg-emerald-600 text-white text-3xl font-bold py-6 rounded-2xl shadow-lg"
          >
            다음 (이용권 선택)
          </button>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => router.back()}
              className="w-full py-3 text-xl text-gray-500 bg-stone-100 rounded-xl"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-6">
            구매할 이용권을 선택하세요
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-8 max-h-[60vh] overflow-y-auto p-2">
            {PASS_TYPES.map((pass) => (
              <button
                key={pass.name}
                onClick={() => setSelectedPass(pass)}
                className={`p-6 rounded-2xl border-4 text-left transition-all ${
                  selectedPass?.name === pass.name
                    ? "border-emerald-500 bg-emerald-50 shadow-lg scale-105"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="text-xl font-bold text-gray-900">
                  {pass.name}
                </div>
                <div className="text-lg text-emerald-600 font-bold mt-1">
                  {pass.price.toLocaleString()}원
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={handleComplete}
            disabled={!selectedPass || loading}
            className="w-full bg-emerald-600 text-white text-3xl font-bold py-6 rounded-2xl shadow-lg disabled:opacity-50"
          >
            {loading ? "처리중..." : "결제 및 가입 완료"}
          </button>
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-stone-200 text-gray-700 text-2xl font-bold py-5 rounded-2xl shadow-md"
            >
              이전 단계
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 bg-stone-300 text-gray-800 text-2xl font-bold py-5 rounded-2xl shadow-md"
            >
              처음으로
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center flex flex-col items-center max-w-2xl w-full border-4 border-emerald-500">
          <div className="bg-emerald-100 text-emerald-800 px-6 py-2 rounded-full font-bold mb-6">
            가입 완료!
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {name}님 환영합니다
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            아래 QR 코드를 <strong>휴대폰 카메라</strong>로 스캔하여
            <br />
            <span className="text-emerald-600 font-bold">모바일 티켓</span>을
            저장해 주세요.
          </p>
          <div className="p-6 border-2 border-stone-100 rounded-3xl mb-8 bg-white shadow-inner">
            <QRCode id="qr-code-svg" value={ticketUrl} size={250} />
          </div>
          <div className="flex gap-4 w-full">
            <button
              onClick={() => router.push("/")}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-bold py-5 rounded-2xl shadow-md transition-all"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
