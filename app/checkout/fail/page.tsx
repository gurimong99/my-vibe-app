"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-12 text-zinc-950">
      <section className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-rose-700">TOSS RESULT</p>
        <h1 className="mt-3 text-2xl font-bold">결제 실패</h1>
        <p className="mt-3 leading-7 text-zinc-600">
          토스페이먼츠 결제창에서 결제가 완료되지 않았습니다.
        </p>

        <dl className="mt-6 grid gap-3 rounded-md bg-zinc-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="font-bold text-zinc-500">오류 코드</dt>
            <dd className="break-all text-right font-semibold">
              {code ?? "없음"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-bold text-zinc-500">메시지</dt>
            <dd className="break-all text-right font-semibold">
              {message ?? "없음"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-bold text-zinc-500">주문번호</dt>
            <dd className="break-all text-right font-semibold">
              {orderId ?? "없음"}
            </dd>
          </div>
        </dl>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-zinc-900 px-4 py-3 font-bold text-white transition hover:bg-zinc-800"
        >
          테스트 화면으로 돌아가기
        </Link>
      </section>
    </main>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f7fb] px-6 py-12 text-zinc-950">
          <section className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-rose-700">TOSS RESULT</p>
            <h1 className="mt-3 text-2xl font-bold">결제 결과 확인 중</h1>
          </section>
        </main>
      }
    >
      <CheckoutFailContent />
    </Suspense>
  );
}
