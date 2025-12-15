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
  const [password, setPassword] = useState("");
  const [selectedPass, setSelectedPass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ticketUrl, setTicketUrl] = useState("");
  const [origin, setOrigin] = useState("");

  // 모달 상태
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

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length <= 11) setPhone(raw);
  };

  const goToPassSelection = async () => {
    if (!name || phone.length < 10) {
      setModal({
        isOpen: true,
        type: "error",
        title: "입력 오류",
        message: "이름과 전화번호를 정확히 입력해주세요.",
      });
      return;
    }
    if (!password || password.length < 4) {
      setModal({
        isOpen: true,
        type: "error",
        title: "비밀번호 오류",
        message: "2차 비밀번호를 4자리 이상 입력해주세요.",
      });
      return;
    }

    const formatted = phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    const { data } = await supabase
      .from("members")
      .select("id")
      .eq("phone_number", formatted)
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
      const formatted = phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
      const uniqueQrCode = crypto.randomUUID();

      const { data: newMember, error: memberError } = await supabase
        .from("members")
        .insert({
          name,
          phone_number: formatted,
          qr_code: uniqueQrCode,
          second_password: password,
        })
        .select()
        .single();

      if (memberError) throw memberError;
      newMemberId = newMember.id;

      const { error: purchaseError } = await supabase
        .from("purchase_history")
        .insert({
          member_id: newMember.id,
          phone_number: formatted,
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

  // ... (QR 다운로드 로직은 동일) ...
  const downloadQr = () => {
    /* 기존 코드 유지 */
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
                placeholder="01012345678"
              />
            </div>
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">
                2차 비밀번호 (4자리 이상)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-2xl p-4 border-2 border-stone-300 rounded-xl"
                placeholder="비밀번호 입력"
                maxLength={20}
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

      {/* 2단계, 3단계 코드는 기존과 동일하되 위쪽 AlertModal만 추가됨 */}
      {step === 2 && (
        /* ... 기존 2단계 UI 코드 ... */
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
