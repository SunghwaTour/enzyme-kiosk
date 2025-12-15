"use client";

export default function AlertModal({
  isOpen,
  type = "alert",
  title,
  message,
  onClose,
  onConfirm,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200 border border-stone-100">
        <div className="mb-6">
          {/* 아이콘 표시 */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              type === "error" ? "bg-red-100 text-3xl" : "bg-stone-100 text-3xl"
            }`}
          >
            {type === "error" ? "🚨" : type === "confirm" ? "🤔" : "VX"}
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 whitespace-pre-line leading-relaxed text-lg">
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          {/* confirm 타입일 때만 취소 버튼 표시 */}
          {type === "confirm" && (
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 rounded-xl bg-stone-200 text-gray-600 font-bold hover:bg-stone-300 transition-colors active:scale-95"
            >
              취소
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            disabled={loading}
            className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
              type === "error"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "처리중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
