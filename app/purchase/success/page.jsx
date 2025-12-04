"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const name = searchParams.get("name")
  const type = searchParams.get("type")
  const count = searchParams.get("count")

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
      {/* 헤더 */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-md p-8 mb-8 text-center">
        <h1 className="text-5xl font-bold text-emerald-700">구매 완료</h1>
      </div>

      {/* 성공 메시지 */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-md p-16 mb-8 text-center">
        <div className="text-8xl mb-8">🎉</div>
        <p className="text-4xl font-bold text-gray-900 mb-6">{name}님</p>
        <p className="text-3xl text-gray-700 mb-8">이용권 구매가 완료되었습니다!</p>

        <div className="border-t-2 border-stone-200 pt-8 mt-8">
          <p className="text-2xl text-gray-600 mb-2">구매하신 이용권</p>
          <p className="text-4xl font-bold text-emerald-600 mb-4">{type}</p>
          <p className="text-3xl text-emerald-600">사용 가능 횟수: {count}회</p>
        </div>
      </div>

      <p className="text-2xl text-gray-600">3초 후 자동으로 돌아갑니다...</p>
    </div>
  )
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-200 flex items-center justify-center">
          <p className="text-3xl">로딩중...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
