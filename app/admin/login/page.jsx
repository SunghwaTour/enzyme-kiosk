"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  useEffect(() => {
    // 이미 로그인되어 있으면 대시보드로 바로 이동
    if (localStorage.getItem("admin_auth") === "true") {
      router.replace("/admin");
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "020308") {
      localStorage.setItem("admin_auth", "true");
      router.replace("/admin");
    } else {
      alert("비밀번호가 일치하지 않습니다.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">관리자 로그인</h1>
        <p className="text-gray-500 mb-8">접근 권한이 필요합니다.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            className="w-full text-xl p-4 border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none text-center tracking-widest"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-stone-800 text-white text-xl font-bold py-4 rounded-xl hover:bg-stone-900 transition-all"
          >
            확인
          </button>
        </form>

        <button
          onClick={() => router.push("/")}
          className="mt-6 text-gray-400 underline text-sm"
        >
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}
