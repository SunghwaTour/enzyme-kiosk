"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";

export default function AdminPage() {
  const router = useRouter();
  // 기본 탭을 '회원 관리(members)'로 설정
  const [activeTab, setActiveTab] = useState("members");
  const [entryLogs, setEntryLogs] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");

  // 회원 수정 모달 상태
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone_number: "",
    second_password: "",
  });

  // 🔐 보안 체크
  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth");
    if (isAuth !== "true") {
      alert("로그인이 필요합니다.");
      router.replace("/admin/login");
    }
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, [router]);

  // 데이터 불러오기
  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "members") {
        const { data } = await supabase
          .from("members")
          .select("*")
          .order("created_at", { ascending: false });
        setMembers(data || []);
      } else if (activeTab === "entry") {
        const { data } = await supabase
          .from("entry_logs")
          .select("*")
          .order("entry_time", { ascending: false })
          .limit(100);
        setEntryLogs(data || []);
      } else if (activeTab === "purchase") {
        const { data } = await supabase
          .from("purchase_history")
          .select("*")
          .order("purchase_date", { ascending: false })
          .limit(100);
        setPurchases(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/");
  };

  // 검색 필터
  const filterData = (data) => {
    if (!searchTerm) return data;
    return data.filter(
      (item) =>
        item.name?.includes(searchTerm) ||
        item.phone_number?.includes(searchTerm)
    );
  };

  // 회원 수정 모달 열기
  const openEditModal = (member) => {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      phone_number: member.phone_number,
      second_password: member.second_password || "",
    });
    setIsEditOpen(true);
  };

  // 회원 정보 업데이트
  const handleUpdateMember = async () => {
    if (!editForm.name || editForm.phone_number.length < 10)
      return alert("정보를 확인해주세요.");
    try {
      const formatted = editForm.phone_number.replace(
        /(\d{3})(\d{4})(\d{4})/,
        "$1-$2-$3"
      );
      const { error } = await supabase
        .from("members")
        .update({
          name: editForm.name,
          phone_number: formatted,
          second_password: editForm.second_password,
        })
        .eq("id", editingMember.id);
      if (error) throw error;

      alert("수정되었습니다.");
      setIsEditOpen(false);
      loadData();
    } catch (err) {
      alert("수정 실패");
    }
  };

  // 회원 강제 탈퇴
  const handleForceDelete = async (member) => {
    if (!confirm(`[관리자] '${member.name}' 회원을 강제 탈퇴시키겠습니까?`))
      return;
    try {
      // 로그 남기기 (선택 사항)
      await supabase
        .from("member_logs")
        .insert({
          phone_number: member.phone_number,
          name: member.name,
          action_type: "강제탈퇴",
        });

      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", member.id);
      if (error) throw error;

      alert("삭제되었습니다.");
      loadData();
    } catch (err) {
      alert("삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
          <h1 className="text-3xl font-extrabold text-[#4A5D4F]">
            관리자 대시보드
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
            >
              메인으로
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-[#4A5D4F] text-white font-bold hover:bg-[#3A4D3F] transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex gap-3 mb-6">
          {[
            { id: "members", label: "👥 회원 관리" },
            { id: "entry", label: "🚪 입실 기록" },
            { id: "purchase", label: "💳 구매 내역" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 rounded-2xl text-lg font-bold transition-all shadow-sm ${
                activeTab === tab.id
                  ? "bg-white text-[#4A5D4F] border-2 border-[#4A5D4F]"
                  : "bg-stone-200 text-stone-500 hover:bg-stone-300 border-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 검색창 */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름 또는 전화번호 검색..."
            className="w-full p-4 text-lg border-2 border-stone-200 rounded-2xl focus:border-[#4A5D4F] outline-none bg-white shadow-sm"
          />
        </div>

        {/* 데이터 테이블 영역 */}
        <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-stone-200 min-h-[600px]">
          {loading ? (
            <div className="p-20 text-center text-gray-400 text-lg animate-pulse">
              데이터를 불러오는 중입니다...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-sm">
                  <tr>
                    {activeTab === "members" ? (
                      <>
                        <th className="p-5 font-bold">가입일</th>
                        <th className="p-5 font-bold">이름</th>
                        <th className="p-5 font-bold">전화번호</th>
                        <th className="p-5 font-bold text-center">2차 비번</th>
                        <th className="p-5 font-bold text-center">
                          모바일 티켓
                        </th>
                        <th className="p-5 font-bold text-center">관리</th>
                      </>
                    ) : (
                      <>
                        <th className="p-5 font-bold">날짜/시간</th>
                        <th className="p-5 font-bold">이름</th>
                        <th className="p-5 font-bold">전화번호</th>
                        <th className="p-5 font-bold">내용</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {/* 회원 목록 */}
                  {activeTab === "members" &&
                    filterData(members).map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-[#F5F5F0] transition-colors"
                      >
                        <td className="p-5">
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-5 font-bold text-lg">{m.name}</td>
                        <td className="p-5">{m.phone_number}</td>
                        <td className="p-5 text-center font-mono text-emerald-600 font-bold text-lg">
                          {m.second_password || (
                            <span className="text-red-300 text-sm">미설정</span>
                          )}
                        </td>
                        <td className="p-5 text-center">
                          {/* QR 코드 (클릭 시 사이트 연결) */}
                          {m.qr_code && origin ? (
                            <a
                              href={`${origin}/my-qr/${m.qr_code}`}
                              target="_blank"
                              className="inline-block p-2 bg-white border border-stone-200 rounded-xl hover:border-[#4A5D4F] hover:scale-105 transition-all shadow-sm"
                              title="클릭하면 모바일 티켓이 열립니다"
                            >
                              <QRCode
                                value={`${origin}/my-qr/${m.qr_code}`}
                                size={48}
                              />
                            </a>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEditModal(m)}
                              className="bg-white border border-stone-300 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-stone-50"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleForceDelete(m)}
                              className="bg-red-50 border border-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-100"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {/* 입실/구매 기록 */}
                  {(activeTab === "entry" || activeTab === "purchase") &&
                    filterData(
                      activeTab === "entry" ? entryLogs : purchases
                    ).map((item) => (
                      <tr key={item.id} className="hover:bg-[#F5F5F0]">
                        <td className="p-5 text-stone-500">
                          {new Date(
                            item.entry_time || item.purchase_date
                          ).toLocaleString()}
                        </td>
                        <td className="p-5 font-bold">{item.name}</td>
                        <td className="p-5">{item.phone_number}</td>
                        <td className="p-5">
                          {activeTab === "entry" ? (
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                              {item.pass_type} 입실
                            </span>
                          ) : (
                            <div>
                              <span className="font-bold text-[#4A5D4F]">
                                {item.pass_type}
                              </span>
                              <span className="ml-2 text-sm text-stone-400">
                                ({item.remaining_count}회 남음)
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 회원 정보 수정 모달 */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              회원 정보 수정
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-500 mb-1">
                  이름
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full p-3 text-lg border-2 border-stone-200 rounded-xl focus:border-[#4A5D4F] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-500 mb-1">
                  전화번호
                </label>
                <input
                  value={editForm.phone_number}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      phone_number: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                  className="w-full p-3 text-lg border-2 border-stone-200 rounded-xl focus:border-[#4A5D4F] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-500 mb-1">
                  2차 비밀번호
                </label>
                <input
                  value={editForm.second_password}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      second_password: e.target.value,
                    })
                  }
                  className="w-full p-3 text-lg border-2 border-stone-200 rounded-xl focus:border-[#4A5D4F] outline-none bg-yellow-50"
                  placeholder="새 비밀번호"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsEditOpen(false)}
                className="flex-1 bg-stone-200 text-stone-600 font-bold py-4 rounded-xl hover:bg-stone-300"
              >
                취소
              </button>
              <button
                onClick={handleUpdateMember}
                className="flex-1 bg-[#4A5D4F] text-white font-bold py-4 rounded-xl hover:bg-[#3A4D3F]"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
