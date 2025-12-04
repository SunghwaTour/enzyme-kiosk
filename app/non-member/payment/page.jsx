"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NonMemberPaymentPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [showKeypad, setShowKeypad] = useState(false)

  const handleNumberClick = (num) => {
    if (phone.length < 11) {
      setPhone(phone + num)
    }
  }

  const handle010Click = () => {
    setPhone("010")
  }

  const handleDelete = () => {
    setPhone(phone.slice(0, -1))
  }

  const handleClear = () => {
    setPhone("")
  }

  const handlePayment = () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요.")
      return
    }
    if (phone.length !== 11) {
      alert("전화번호 11자리를 입력해주세요.")
      return
    }

    // 실제로는 결제 모듈 호출
    // 여기서는 바로 성공 페이지로 이동
    router.push(`/non-member/success?name=${encodeURIComponent(name)}&phone=${phone}`)
  }

  const formatPhoneNumber = (number) => {
    if (number.length <= 3) return number
    if (number.length <= 7) return `${number.slice(0, 3)}-${number.slice(3)}`
    return `${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7)}`
  }

  return (
    <div className="h-screen bg-stone-50 flex flex-col items-center justify-center p-3 overflow-hidden">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6 mb-3">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">비회원 1회권 결제</h2>

        <div className="mb-4">
          <label className="block text-xl font-semibold text-gray-700 mb-2">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full text-2xl p-3 border-2 border-stone-300 rounded-xl focus:border-emerald-600 focus:outline-none bg-stone-50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xl font-semibold text-gray-700 mb-2">전화번호</label>
          <input
            type="text"
            value={formatPhoneNumber(phone)}
            readOnly
            onClick={() => setShowKeypad(true)}
            placeholder="전화번호를 입력하세요"
            className="w-full text-2xl p-3 border-2 border-stone-300 rounded-xl bg-stone-50 cursor-pointer"
          />
        </div>

        {showKeypad && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="bg-stone-100 border-2 border-stone-200 hover:bg-stone-200 text-3xl font-bold py-4 rounded-xl transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handle010Click}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold py-4 rounded-xl transition-all active:scale-95 shadow-md"
            >
              010
            </button>
            <button
              onClick={() => handleNumberClick("0")}
              className="bg-stone-100 border-2 border-stone-200 hover:bg-stone-200 text-3xl font-bold py-4 rounded-xl transition-all active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold py-4 rounded-xl transition-all active:scale-95 shadow-md"
            >
              ⌫
            </button>
          </div>
        )}

        <div className="bg-emerald-50 border-2 border-emerald-600 rounded-xl p-4 mb-4 text-center">
          <p className="text-xl text-gray-700 mb-1">결제 금액</p>
          <p className="text-4xl font-bold text-emerald-700">40,000원</p>
          <p className="text-lg text-gray-600 mt-1">(1회권)</p>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg"
        >
          결제하기
        </button>
      </div>

      <button
        onClick={() => router.push("/")}
        className="bg-stone-300 hover:bg-stone-400 text-gray-900 text-xl font-semibold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-md"
      >
        처음으로
      </button>
    </div>
  )
}
