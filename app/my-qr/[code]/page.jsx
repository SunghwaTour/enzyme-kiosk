"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";

export default function MyQrPage({ params }) {
  // Next.js 15+ 에서는 params가 Promise입니다.
  const { code } = use(params);

  const [member, setMember] = useState(null);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberInfo = async () => {
      if (!code) return;

      try {
        // 1. 보안 코드(UUID)로 회원 및 이용권 정보 조회
        const { data, error } = await supabase
          .from("members")
          .select(
            `
            *,
            purchase_history (
              remaining_count,
              is_active
            )
          `
          )
          .eq("qr_code", code)
          .single();

        if (error) throw error;

        if (data) {
          setMember(data);
          // 잔여 횟수 합산
          const total = data.purchase_history
            ?.filter((p) => p.is_active)
            .reduce((sum, p) => sum + p.remaining_count, 0);
          setTotalRemaining(total || 0);
        }
      } catch (err) {
        console.error("정보 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberInfo();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-gray-500 animate-pulse">
          티켓 불러오는 중...
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-red-500">
          유효하지 않은 티켓입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200">
        {/* 상단 헤더 */}
        <div className="bg-emerald-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">
            효소방 모바일 티켓
          </h1>
          <p className="text-emerald-100 text-sm">
            입장 시 리더기에 QR을 비춰주세요
          </p>
        </div>

        {/* 회원 정보 영역 */}
        <div className="p-8 flex flex-col items-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {member.name} 님
          </div>
          <div className="text-lg text-gray-500 mb-8">
            {member.phone_number}
          </div>

          {/* 입장용 QR 코드 */}
          <div className="bg-white p-4 border-2 border-stone-100 rounded-2xl shadow-sm mb-8">
            <QRCode
              value={code} // 여기에 실제 입장용 UUID가 들어갑니다
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>

          {/* 잔여 횟수 정보 */}
          <div className="w-full bg-emerald-50 rounded-xl p-4 text-center mb-6">
            <p className="text-gray-600 text-sm mb-1">현재 잔여 횟수</p>
            <p className="text-3xl font-bold text-emerald-600">
              {totalRemaining}회
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            * 이 화면을 캡처하여 보관하시면 편리합니다.
            <br />* QR 코드는 보안을 위해 주기적으로 변경될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
