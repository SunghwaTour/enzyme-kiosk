"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";

export default function FindQrPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1:조회, 2:확인, 3:완료
  const [phone, setPhone] = useState("");
  const [foundMember, setFoundMember] = useState(null);
  const [newQrCode, setNewQrCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw.length <= 11) setPhone(raw);
  };

  // 1. 조회
  const findMember = async () => {
    if (phone.length < 10) return alert("전화번호를 입력해주세요.");
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
        setStep(2);
      } else {
        alert("가입되지 않은 정보입니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    }
    setLoading(false);
  };

  // 2. 재발급 실행 (확실하게 업데이트 확인)
  const regenerate = async () => {
    setLoading(true);
    try {
      const newCode = crypto.randomUUID();
      // 업데이트 후 변경된 데이터 반환 요청 (.select())
      const { data, error } = await supabase
        .from("members")
        .update({ qr_code: newCode })
        .eq("id", foundMember.id)
        .select();

      if (error || !data || data.length === 0) throw new Error("업데이트 실패");

      setNewQrCode(newCode);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("QR 코드 재발급에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // QR 다운로드
  const downloadQr = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const size = 500;
    canvas.width = size;
    canvas.height = size;
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${foundMember.name}_재발급QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      {step === 1 && (
        <div className="w-full max-w-xl bg-white p-10 rounded-3xl shadow-xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            QR 재발급
          </h2>
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
            className="w-full bg-emerald-600 text-white text-3xl font-bold py-6 rounded-2xl shadow-lg"
          >
            {loading ? "조회중..." : "내 정보 찾기"}
          </button>
          <button
            onClick={() => router.back()}
            className="w-full mt-4 py-4 text-xl text-gray-500"
          >
            취소
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-xl bg-white p-10 rounded-3xl shadow-xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            본인이 맞으신가요?
          </h2>
          <div className="bg-stone-100 p-6 rounded-2xl mb-8">
            <p className="text-4xl font-bold text-emerald-700 mb-2">
              {foundMember.name} 님
            </p>
            <p className="text-xl text-gray-500">{foundMember.phone_number}</p>
          </div>
          <p className="text-red-500 mb-8 text-sm">
            ※ 재발급 시 기존 QR 코드는 즉시 무효화됩니다.
          </p>
          <button
            onClick={regenerate}
            disabled={loading}
            className="w-full bg-emerald-600 text-white text-3xl font-bold py-6 rounded-2xl shadow-lg"
          >
            {loading ? "생성중..." : "네, 재발급 해주세요"}
          </button>
          <button
            onClick={() => setStep(1)}
            className="w-full mt-4 py-4 text-xl text-gray-500"
          >
            아니요 (뒤로)
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center flex flex-col items-center">
          <h2 className="text-4xl font-bold text-emerald-700 mb-4">
            재발급 완료!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            새로운 QR 코드입니다.
            <br />꼭 저장해 주세요.
          </p>
          <div className="p-4 border-2 border-stone-100 rounded-xl mb-8 bg-white">
            <QRCode id="qr-code-svg" value={newQrCode} size={220} />
          </div>
          <div className="flex gap-4 w-full">
            <button
              onClick={downloadQr}
              className="flex-1 bg-stone-700 hover:bg-stone-800 text-white text-2xl font-bold py-5 rounded-2xl shadow-md flex items-center justify-center gap-2"
            >
              <span>💾 저장</span>
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 bg-emerald-600 text-white text-2xl font-bold py-5 rounded-2xl shadow-md"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
