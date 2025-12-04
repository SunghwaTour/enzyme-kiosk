"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-6 overflow-hidden font-sans select-none relative">
      {/* 1. 로고 및 헤더 영역 */}
      <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-6xl font-extrabold text-[#4A5D4F] tracking-tight mb-4">
          내몸에 효소욕
        </h1>
        <p className="text-2xl text-[#8A9A8E] font-medium">
          프리미엄 효소 찜질 & 힐링 스페이스
        </p>
        <div className="w-20 h-1.5 bg-[#4A5D4F] mx-auto mt-6 rounded-full opacity-20"></div>
      </div>

      {/* 2. 메인 액션 버튼 (카드형 배치) */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-5xl mb-10">
        {/* 입장하기 (QR 스캔) */}
        <button
          onClick={() => router.push("/entry?mode=qr")}
          className="group bg-white p-12 rounded-[3rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 border border-[#E0E0D0] flex flex-col items-center justify-center gap-8 active:scale-[0.98]"
        >
          <div className="bg-[#E8F3EB] p-8 rounded-full group-hover:bg-[#4A5D4F] transition-colors duration-300 flex items-center justify-center w-44 h-44 relative">
            <Image
              src="/enter-icon.png"
              alt="입장하기 아이콘"
              width={100}
              height={100}
              className="object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-[#2C3E30] mb-3 group-hover:text-[#4A5D4F] transition-colors">
              입장하기
            </h2>
            <p className="text-[#8A9A8E] text-xl">QR 코드를 스캔해주세요</p>
          </div>
        </button>

        {/* 회원가입 (내 QR 만들기) */}
        <button
          onClick={() => router.push("/signup")}
          className="group bg-[#4A5D4F] p-12 rounded-[3rem] shadow-[0_20px_40px_-15px_rgba(74,93,79,0.4)] hover:shadow-[0_30px_60px_-12px_rgba(74,93,79,0.5)] transition-all duration-300 flex flex-col items-center justify-center gap-8 active:scale-[0.98]"
        >
          <div className="bg-[#5C7262] p-8 rounded-full group-hover:bg-white transition-colors duration-300 flex items-center justify-center w-44 h-44">
            <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
              ✨
            </span>
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-3">회원가입</h2>
            <p className="text-[#C8D6CC] text-xl">나만의 QR 만들기</p>
          </div>
        </button>
      </div>

      {/* 3. 하단 서브 메뉴 (가로 배치) */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-sm p-4 flex justify-between items-center border border-[#E0E0D0]">
        {[
          { label: "이용권 구매", path: "/purchase", icon: "💳" },
          { label: "잔여 횟수", path: "/check", icon: "📊" },
          { label: "비회원 입장", path: "/non-member", icon: "🎫" },
          { label: "회원 탈퇴", path: "/withdraw", icon: "🚪" },
        ].map((item, index) => (
          <div key={item.label} className="flex-1 flex items-center">
            <button
              onClick={() => router.push(item.path)}
              className="w-full py-6 hover:bg-[#F5F5F0] rounded-2xl transition-colors text-[#4A5D4F] font-bold text-2xl flex items-center justify-center gap-3 active:scale-95"
            >
              <span className="text-3xl">{item.icon}</span>
              {item.label}
            </button>
            {/* 메뉴 사이 구분선 */}
            {index < 3 && <div className="h-10 w-[1px] bg-[#E0E0D0]"></div>}
          </div>
        ))}
      </div>

      {/* 4. 관리자 모드 버튼 (화면 최하단에 표시) */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <button
          onClick={() => router.push("/admin/login")}
          className="text-[#8A9A8E] text-sm hover:text-[#4A5D4F] underline decoration-[#E0E0D0] underline-offset-4 transition-colors font-medium px-4 py-2"
        >
          관리자 모드
        </button>
      </div>
    </div>
  );
}
