"use client";

import Script from "next/script";
import Link from "next/link";
import { FormEvent, useState } from "react";

type CheckoutLog = { label: string; value: string };

type PreparePaymentResponse = {
  orderId: string;
  provider: string;
  status: string;
  nextAction: string;
  message: string;
  request: {
    total: number;
    orderName: string;
    buyerName: string;
    buyerEmail: string;
  };
};

type TossPaymentsInstance = {
  requestPayment: (
    method: "토스결제",
    options: {
      amount: number;
      orderId: string;
      orderName: string;
      customerName: string;
      customerEmail: string;
      successUrl: string;
      failUrl: string;
    },
  ) => Promise<void>;
};

type TossPaymentsWindow = Window & {
  TossPayments?: (clientKey: string) => TossPaymentsInstance;
};

const formatPrice = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const paymentApiBaseUrl =
  process.env.NEXT_PUBLIC_PAYMENT_API_BASE_URL ?? "http://localhost:8080";

export default function PaymentTestPage() {
  const [logs, setLogs] = useState<CheckoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const amount = 1000;
  const tax = 0;
  const total = amount + tax;

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setLogs([{ label: "시작", value: "payment-server 결제 준비 API 호출 중" }]);

    try {
      const response = await fetch(
        `${paymentApiBaseUrl}/api/payments/prepare`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "toss",
            amount,
            tax,
            total,
            orderName: "토스 테스트 상품",
            buyerName: "테스터",
            buyerEmail: "test@example.com",
          }),
        },
      );

      const payload = (await response.json()) as PreparePaymentResponse;

      if (!response.ok) {
        throw new Error("결제 준비 요청에 실패했습니다.");
      }

      setLogs([
        { label: "공급자", value: payload.provider },
        { label: "상태", value: payload.status },
        { label: "주문번호", value: payload.orderId },
        { label: "다음 단계", value: payload.nextAction },
      ]);

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

      if (!clientKey) {
        throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY가 설정되지 않았습니다.");
      }

      const tossPayments = (window as TossPaymentsWindow).TossPayments?.(
        clientKey,
      );

      if (!tossPayments) {
        throw new Error("토스페이먼츠 SDK가 아직 로드되지 않았습니다.");
      }

      await tossPayments.requestPayment("토스결제", {
        amount: payload.request.total,
        orderId: payload.orderId,
        orderName: payload.request.orderName,
        customerName: payload.request.buyerName,
        customerEmail: payload.request.buyerEmail,
        successUrl: `${getAppBaseUrl()}/checkout/success`,
        failUrl: `${getAppBaseUrl()}/checkout/fail`,
      });
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        {
          label: "오류",
          value:
            error instanceof Error
              ? error.message
              : "토스 테스트 결제를 시작하지 못했습니다.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v1/payment"
        strategy="lazyOnload"
      />
      <main className="min-h-screen bg-[#f5f7fb] text-zinc-950">
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold text-blue-700">TOSS TEST</p>
              <h1 className="mt-3 text-3xl font-bold tracking-normal">
                토스 결제 테스트 페이지
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
                `payment-server`의 결제 준비 API를 호출한 뒤 토스페이먼츠
                테스트 결제창을 실행합니다.
              </p>
            </div>
            <Link
              href="/adsense"
              className="inline-flex shrink-0 rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-800 transition hover:border-blue-300 hover:text-blue-700"
            >
              애드센스 테스트 페이지
            </Link>
          </div>
        </section>

        <form
          onSubmit={handlePayment}
          className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-[1fr_340px]"
        >
          <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">결제 수단</h2>
            <div className="mt-5 flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-600 text-lg font-black text-white">
                T
              </div>
              <div>
                <p className="font-bold">토스페이먼츠</p>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  다른 결제 연결 없이 토스 테스트 결제창만 호출합니다.
                </p>
              </div>
            </div>
          </section>

          <aside className="self-start rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">결제 정보</h2>
            <div className="mt-5 grid gap-3">
              <div className="flex justify-between text-sm font-semibold text-zinc-600">
                <span>금액</span>
                <span>{formatPrice.format(amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-zinc-600">
                <span>세금</span>
                <span>{formatPrice.format(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-4 text-lg font-black">
                <span>총 금액</span>
                <span>{formatPrice.format(total)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-md bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isLoading ? "토스 결제 준비 중" : "토스 테스트 결제 시작"}
            </button>
          </aside>

          {logs.length > 0 && (
            <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm md:col-span-2">
              <h2 className="text-lg font-bold">테스트 로그</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {logs.map((log, index) => (
                  <div
                    key={`${log.label}-${index}`}
                    className="rounded-md bg-zinc-50 p-3"
                  >
                    <p className="text-xs font-bold text-zinc-500">
                      {log.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold leading-6">
                      {log.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </form>
      </main>
    </>
  );
}

function getAppBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_BASE_URL ?? window.location.origin;
}
