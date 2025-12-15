"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Scanner } from "@yudiel/react-qr-scanner";
import AlertModal from "@/components/AlertModal"; // 모달 불러오기

// 상품 목록
const PRODUCTS = [
  { name: "1회권 (첫 체험)", count: 1, price: 35000 },
  { name: "1회권", count: 1, price: 40000 },
  { name: "12회권", count: 12, price: 400000 },
  { name: "26회권", count: 26, price: 800000 },
  { name: "50회권", count: 50, price: 1200000 },
  { name: "70회권", count: 70, price: 1600000 },
  { name: "100회권", count: 100, price: 2000000 },
];

export default function PurchasePage() {
  const router = useRouter();
  const [step, setStep] = useState("scan");
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✨ 모달 상태 관리
  const [modal, setModal] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });
  const [pendingProduct, setPendingProduct] = useState(null); // 구매 대기중인 상품

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const handleScan = async (detectedCodes) => {
    if (detectedCodes?.[0]?.rawValue && !loading) {
      const qrValue = detectedCodes[0].rawValue;
      let code = qrValue;
      if (qrValue.includes("/my-qr/")) {
        code = qrValue.split("/my-qr/")[1];
      }

      setLoading(true);
      const { data } = await supabase
        .from("members")
        .select("*")
        .eq("qr_code", code)
        .single();

      if (data) {
        setMember(data);
        setStep("select");
      } else {
        setModal({
          isOpen: true,
          type: "error",
          title: "오류",
          message: "등록되지 않은 회원 QR입니다.",
        });
      }
      setLoading(false);
    }
  };

  // 구매 버튼 클릭 시 -> 확인 모달 띄우기
  const onProductClick = (product) => {
    setPendingProduct(product);
    setModal({
      isOpen: true,
      type: "confirm",
      title: "구매 확인",
      message: `${member.name}님,\n[${product.name}]을 구매하시겠습니까?`,
    });
  };

  // 모달에서 '확인' 눌렀을 때 실행될 함수
  const processPurchase = async () => {
    if (!pendingProduct) return;

    setLoading(true);
    try {
      await supabase.from("purchase_history").insert({
        member_id: member.id,
        phone_number: member.phone_number,
        name: member.name,
        pass_type: pendingProduct.name,
        purchase_count: pendingProduct.count,
        remaining_count: pendingProduct.count,
        is_active: true,
      });

      setModal({
        isOpen: true,
        type: "alert",
        title: "구매 완료!",
        message: "이용권이 정상적으로 충전되었습니다.",
        onConfirm: () => router.push("/"), // 확인 누르면 홈으로
      });
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        type: "error",
        title: "오류 발생",
        message: "구매 처리 중 문제가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      {/* ✨ 모달 컴포넌트 배치 */}
      <AlertModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.type === "confirm" ? processPurchase : modal.onConfirm}
        loading={loading}
      />

      {step === "scan" && (
        <div className="w-full max-w-lg text-center">
          <h1 className="text-4xl font-bold mb-8">이용권 구매</h1>
          <p className="text-2xl mb-4 text-gray-600">
            회원님의 QR 코드를 보여주세요
          </p>
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
      )}

      {step === "select" && member && (
        <div className="w-full max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-2">
            {member.name}님
          </h2>
          <p className="text-xl text-center text-gray-500 mb-8">
            {member.phone_number}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
            {PRODUCTS.map((p) => (
              <button
                key={p.name}
                onClick={() => onProductClick(p)}
                className="bg-white p-6 rounded-2xl shadow-lg border-b-[6px] border-stone-200 active:border-b-0 active:translate-y-[6px] transition-all hover:bg-emerald-50"
              >
                <div className="text-xl font-bold text-gray-800 mb-1">
                  {p.name}
                </div>
                <div className="text-lg text-emerald-600 font-bold">
                  {p.price.toLocaleString()}원
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep("scan")}
            className="w-full mt-8 py-5 bg-stone-300 rounded-2xl text-xl font-bold"
          >
            취소하고 다시 찍기
          </button>
        </div>
      )}
    </div>
  );
}
