"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function NonMemberSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get("name")
  const phone = searchParams.get("phone")

  const formatPhoneNumber = (number) => {
    if (!number) return ""
    if (number.length !== 11) return number
    return `${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7)}`
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-md p-12 text-center">
        <div className="text-8xl mb-8">✅</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-8">결제 완료</h2>
        <p className="text-3xl text-gray-800 mb-4">{name || "고객"}님</p>
        <p className="text-2xl text-gray-700 mb-4">1회권 구매가 완료되었습니다.</p>
        <p className="text-xl text-gray-600 mb-12">{formatPhoneNumber(phone)}</p>

        <div className="bg-emerald-50 border-2 border-emerald-600 rounded-2xl p-8 mb-8">
          <p className="text-5xl font-bold text-emerald-700 mb-4">편안한 시간 되십시오</p>
        </div>

        <p className="text-xl text-gray-500">5초 후 자동으로 처음 화면으로 돌아갑니다.</p>
      </div>

      <button
        onClick={() => router.push("/")}
        className="mt-8 bg-stone-300 hover:bg-stone-400 text-gray-900 text-xl font-semibold py-4 px-12 rounded-2xl transition-all active:scale-95 shadow-md"
      >
        처음으로
      </button>
    </div>
  )
}
