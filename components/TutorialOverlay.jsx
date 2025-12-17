"use client";

export default function TutorialOverlay({ isOpen, onClose, page = "home" }) {
  if (!isOpen) return null;

  // 페이지별 콘텐츠 설정
  const getContent = () => {
    switch (page) {
      case "signup":
        return (
          <div className="w-full max-w-5xl px-6 mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 border-4 border-dashed border-white/30 p-8 rounded-3xl flex flex-col items-center text-center">
              <span className="text-5xl mb-4">📝</span>
              <h3 className="text-2xl font-bold text-white mb-2">
                1. 정보 입력
              </h3>
              <p className="text-stone-300">
                이름과 전화번호를
                <br />
                정확히 입력해주세요.
              </p>
            </div>
            <div className="bg-white/10 border-4 border-dashed border-white/30 p-8 rounded-3xl flex flex-col items-center text-center">
              <span className="text-5xl mb-4">🎫</span>
              <h3 className="text-2xl font-bold text-white mb-2">
                2. 이용권 선택
              </h3>
              <p className="text-stone-300">
                원하시는 시간이나 기간의
                <br />
                이용권을 선택하여 결제합니다.
              </p>
            </div>
            <div className="bg-white/10 border-4 border-dashed border-white/30 p-8 rounded-3xl flex flex-col items-center text-center">
              <span className="text-5xl mb-4">📸</span>
              <h3 className="text-2xl font-bold text-white mb-2">3. QR 저장</h3>
              <p className="text-stone-300">
                발급된 QR코드를
                <br />
                반드시 사진으로 저장해주세요!
              </p>
            </div>
          </div>
        );

      case "entry":
        return (
          <div className="w-full max-w-4xl px-6 mt-20 flex flex-col items-center gap-8">
            <div className="w-full bg-emerald-900/40 border-4 border-dashed border-emerald-400 p-10 rounded-3xl flex flex-col md:flex-row items-center gap-8">
              <div className="text-7xl animate-bounce">📱</div>
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-bold text-emerald-300 mb-2">
                  QR 코드를 비춰주세요
                </h3>
                <p className="text-emerald-100 text-xl leading-relaxed">
                  화면 중앙의 카메라 영역에
                  <br />
                  소지하신 <strong>모바일 티켓(QR)</strong>을 가까이 대주세요.
                </p>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl text-stone-300 text-center">
              💡 QR 인식이 안 된다면 화면 밝기를 최대로 높여주세요.
            </div>
          </div>
        );

      case "home":
      default:
        return (
          <div className="w-full max-w-5xl px-6 mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-100">
            {/* 1. 이용권 구매 */}
            <div className="relative border-4 border-dashed border-emerald-400 bg-emerald-900/40 p-8 rounded-3xl flex flex-col items-center text-center justify-center h-48 md:h-64">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full font-bold text-sm shadow-lg">
                STEP 1
              </div>
              <span className="text-5xl mb-4">🎫</span>
              <h3 className="text-2xl font-bold text-emerald-300 mb-2">
                이용권 구매
              </h3>
              <p className="text-emerald-100/90 leading-relaxed">
                처음 오셨거나 시간이 부족할 때<br />
                <strong>시간/기간 이용권</strong>을 구매합니다.
              </p>
            </div>
            {/* 2. 입장하기 */}
            <div className="relative border-4 border-dashed border-blue-400 bg-blue-900/40 p-8 rounded-3xl flex flex-col items-center text-center justify-center h-48 md:h-64">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full font-bold text-sm shadow-lg">
                STEP 2
              </div>
              <span className="text-5xl mb-4">🚪</span>
              <h3 className="text-2xl font-bold text-blue-300 mb-2">
                입장하기
              </h3>
              <p className="text-blue-100/90 leading-relaxed">
                구매한 이용권(QR)을 찍고
                <br />
                <strong>좌석을 선택하여 입장</strong>합니다.
              </p>
            </div>
            {/* 3. 잔여 횟수 조회 */}
            <div className="relative border-4 border-dashed border-purple-400 bg-purple-900/40 p-6 rounded-3xl flex flex-col items-center text-center justify-center h-40">
              <span className="text-4xl mb-2">📱</span>
              <h3 className="text-xl font-bold text-purple-300 mb-1">
                내 정보 조회
              </h3>
              <p className="text-purple-100/80 text-sm">
                남은 시간이나 횟수를
                <br />
                확인할 수 있어요.
              </p>
            </div>
            {/* 4. 비회원/관리자 */}
            <div className="relative border-4 border-dashed border-stone-400 bg-stone-800/40 p-6 rounded-3xl flex flex-col items-center text-center justify-center h-40">
              <span className="text-4xl mb-2">⚙️</span>
              <h3 className="text-xl font-bold text-stone-300 mb-1">
                기타 기능
              </h3>
              <p className="text-stone-300/80 text-sm">
                비회원 입장, 회원 가입
                <br />
                관리자 설정을 합니다.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm cursor-pointer animate-in fade-in duration-300 flex flex-col items-center justify-center"
    >
      <div className="absolute top-8 right-8 animate-pulse">
        <div className="border-2 border-white/50 bg-black/50 text-white px-6 py-3 rounded-full font-bold text-xl flex items-center gap-2">
          <span>화면을 누르면 닫힙니다</span>
          <span className="text-2xl">✖</span>
        </div>
      </div>

      <div className="absolute top-24 text-center w-full px-4">
        <h2 className="text-3xl font-bold text-yellow-300 mb-2 drop-shadow-md">
          {page === "home"
            ? "💡 키오스크 사용법"
            : page === "signup"
            ? "📝 회원가입 안내"
            : page === "entry"
            ? "🚪 입장 안내"
            : "💡 도움말"}
        </h2>
        <p className="text-stone-300 text-lg">
          {page === "home"
            ? "원하시는 기능의 설명을 확인해보세요"
            : "아래 설명을 참고해주세요"}
        </p>
      </div>

      {getContent()}

      <div className="mt-12 text-stone-400 text-sm animate-bounce">
        ▼ 화면 아무 곳이나 누르면 원래대로 돌아갑니다
      </div>
    </div>
  );
}
