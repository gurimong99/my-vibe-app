"use client";

import { FormEvent, useMemo, useState } from "react";

type PaymentMethod = "paypal" | "card" | "kakao" | "naver";

type CheckoutLog = {
  label: string;
  value: string;
};

const paymentMethods: Array<{
  id: PaymentMethod;
  name: string;
  description: string;
  badge: string;
  icon: string;
  tone: string;
}> = [
  {
    id: "paypal",
    name: "PayPal",
    description: "해외 결제와 USD 정산 테스트",
    badge: "Global",
    icon: "P",
    tone: "border-blue-200 bg-blue-50 text-blue-900",
  },
  {
    id: "card",
    name: "신용카드",
    description: "카드사/PG 모듈 연결 테스트",
    badge: "Card",
    icon: "C",
    tone: "border-zinc-200 bg-white text-zinc-950",
  },
  {
    id: "kakao",
    name: "카카오페이",
    description: "카카오페이 결제 준비/승인 플로우",
    badge: "Kakao",
    icon: "K",
    tone: "border-yellow-200 bg-yellow-50 text-yellow-950",
  },
  {
    id: "naver",
    name: "네이버페이",
    description: "네이버페이 주문서 이동 테스트",
    badge: "Naver",
    icon: "N",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
];

const formatPrice = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

export default function Home() {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [amount, setAmount] = useState(49000);
  const [buyerName, setBuyerName] = useState("홍길동");
  const [buyerEmail, setBuyerEmail] = useState("tester@example.com");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<CheckoutLog[]>([
    { label: "상태", value: "결제수단을 선택하고 테스트 결제를 시작하세요." },
  ]);

  const selectedMethod = useMemo(
    () => paymentMethods.find((item) => item.id === method)!,
    [method],
  );

  const tax = Math.round(amount * 0.1);
  const total = amount + tax;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setLogs([{ label: "요청", value: `${selectedMethod.name} 결제 준비 중` }]);

    try {
      const response = await fetch("/api/payments/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          amount,
          tax,
          total,
          orderName: "결제 테스트 상품",
          buyerName,
          buyerEmail,
        }),
      });

      const payload = (await response.json()) as {
        provider: string;
        status: string;
        nextAction: string;
        redirectUrl?: string;
        message: string;
        envKeys: string[];
      };

      setLogs([
        { label: "공급자", value: payload.provider },
        { label: "상태", value: payload.status },
        { label: "다음 단계", value: payload.nextAction },
        {
          label: "필요 환경변수",
          value: payload.envKeys.length ? payload.envKeys.join(", ") : "없음",
        },
        { label: "안내", value: payload.message },
      ]);
    } catch {
      setLogs([{ label: "오류", value: "결제 준비 요청에 실패했습니다." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_380px] lg:px-10">
          <div>
            <p className="text-sm font-bold text-indigo-700">PAYMENT LAB</p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
              결제 페이지 테스트 화면
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
              PayPal, 신용카드, 카카오페이, 네이버페이 연결을 검증하기 위한
              결제 선택 화면입니다. 지금은 안전한 모의 준비 API로 동작하고,
              실제 키를 넣으면 각 결제사 SDK 호출부로 확장할 수 있습니다.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-bold text-zinc-500">테스트 주문번호</p>
            <p className="mt-2 font-mono text-xl font-bold">
              TEST-{Date.now().toString().slice(-8)}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              실제 결제 전환 시 서버에서 주문번호를 생성하고 결제 승인 결과와
              대조해야 합니다.
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_420px] lg:px-10"
      >
        <section className="grid gap-6">
          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">결제수단 선택</h2>
                <p className="mt-1 text-sm font-medium text-zinc-500">
                  실제 연동 시 선택한 수단별 SDK 또는 PG 승인 API로 연결합니다.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {paymentMethods.map((item) => {
                const isSelected = method === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    className={`rounded-lg border p-5 text-left transition ${
                      isSelected
                        ? "border-zinc-950 bg-white shadow-md"
                        : "border-zinc-200 bg-white hover:border-zinc-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border text-lg font-black ${item.tone}`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{item.name}</h3>
                          <p className="mt-1 leading-6 text-zinc-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">
                        {item.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="text-2xl font-bold">구매자 정보</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-zinc-700">
                이름
                <input
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                  className="h-12 rounded-md border border-zinc-300 px-3 text-base font-semibold outline-none focus:border-indigo-500"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-700">
                이메일
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(event) => setBuyerEmail(event.target.value)}
                  className="h-12 rounded-md border border-zinc-300 px-3 text-base font-semibold outline-none focus:border-indigo-500"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-700">
                상품 금액
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  className="h-12 rounded-md border border-zinc-300 px-3 text-base font-semibold outline-none focus:border-indigo-500"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-700">
                테스트 카드번호
                <input
                  value="4242 4242 4242 4242"
                  readOnly
                  className="h-12 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-base font-semibold text-zinc-500"
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-5">
            <h2 className="text-2xl font-bold">연동 준비 상태</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                "주문 생성 API",
                "결제 준비 API",
                "성공/실패 리다이렉트",
                "웹훅 검증",
                "승인 결과 저장",
                "환불 API",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-md bg-zinc-50 p-3"
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${
                      index < 3
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {index < 3 ? "✓" : "·"}
                  </span>
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="grid gap-6 self-start lg:sticky lg:top-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-zinc-500">선택 결제수단</p>
                <h2 className="mt-1 text-2xl font-bold">
                  {selectedMethod.name}
                </h2>
              </div>
              <div
                className={`grid h-12 w-12 place-items-center rounded-lg border text-lg font-black ${selectedMethod.tone}`}
              >
                {selectedMethod.icon}
              </div>
            </div>

            <div className="mt-6 grid gap-3 border-t border-zinc-200 pt-5">
              <div className="flex justify-between text-sm font-semibold text-zinc-600">
                <span>상품 금액</span>
                <span>{formatPrice.format(amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-zinc-600">
                <span>부가세</span>
                <span>{formatPrice.format(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-3 text-xl font-black">
                <span>총 결제</span>
                <span>{formatPrice.format(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 h-13 w-full rounded-md bg-zinc-950 px-5 py-3 text-base font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isLoading ? "결제 준비 중..." : "테스트 결제 시작"}
            </button>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="text-xl font-bold">테스트 로그</h2>
            <div className="mt-4 grid gap-3">
              {logs.map((log) => (
                <div key={log.label} className="rounded-md bg-zinc-50 p-3">
                  <p className="text-xs font-bold text-zinc-500">{log.label}</p>
                  <p className="mt-1 break-words text-sm font-semibold leading-6">
                    {log.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </form>
    </main>
  );
}
