"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

type ConfirmStatus = "loading" | "success" | "error";

type ConfirmResponse = {
  message?: string;
  status?: string;
  method?: string;
  totalAmount?: number;
  approvedAt?: string;
};

const paymentApiBaseUrl =
  process.env.NEXT_PUBLIC_PAYMENT_API_BASE_URL ?? "http://localhost:8080";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const hasConfirmed = useRef(false);
  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const [message, setMessage] = useState("결제 승인 요청을 보내는 중입니다.");
  const [result, setResult] = useState<ConfirmResponse | null>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (hasConfirmed.current) {
      return;
    }

    hasConfirmed.current = true;

    async function confirmPayment() {
      if (!paymentKey || !orderId || !amount) {
        setStatus("error");
        setMessage("결제 승인에 필요한 값이 부족합니다.");
        return;
      }

      try {
        const response = await fetch(
          `${paymentApiBaseUrl}/api/payments/confirm`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentKey,
              orderId,
              amount: Number(amount),
            }),
          },
        );

        const payload = (await response.json()) as ConfirmResponse;
        setResult(payload);

        if (!response.ok) {
          throw new Error(payload.message ?? "결제 승인 요청에 실패했습니다.");
        }

        setStatus("success");
        setMessage("결제 승인이 완료되었습니다.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "결제 승인 중 오류가 발생했습니다.",
        );
      }
    }

    confirmPayment();
  }, [amount, orderId, paymentKey]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-12 text-zinc-950">
      <section className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-blue-700">TOSS RESULT</p>
        <h1 className="mt-3 text-2xl font-bold">
          {status === "loading" && "결제 승인 처리 중"}
          {status === "success" && "결제 성공"}
          {status === "error" && "결제 승인 오류"}
        </h1>
        <p className="mt-3 leading-7 text-zinc-600">{message}</p>

        <dl className="mt-6 grid gap-3 rounded-md bg-zinc-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="font-bold text-zinc-500">주문번호</dt>
            <dd className="break-all text-right font-semibold">{orderId}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-bold text-zinc-500">결제키</dt>
            <dd className="break-all text-right font-semibold">{paymentKey}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-bold text-zinc-500">금액</dt>
            <dd className="font-semibold">{amount}원</dd>
          </div>
          {result?.method && (
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-zinc-500">결제수단</dt>
              <dd className="font-semibold">{result.method}</dd>
            </div>
          )}
          {result?.approvedAt && (
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-zinc-500">승인시각</dt>
              <dd className="font-semibold">{result.approvedAt}</dd>
            </div>
          )}
        </dl>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          테스트 화면으로 돌아가기
        </Link>
      </section>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f7fb] px-6 py-12 text-zinc-950">
          <section className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-blue-700">TOSS RESULT</p>
            <h1 className="mt-3 text-2xl font-bold">결제 승인 처리 중</h1>
          </section>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
