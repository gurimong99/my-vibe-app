"use client";

import { useEffect, useMemo, useState } from "react";

type MarketItem = {
  symbol: string;
  name: string;
  group: "exchange" | "us" | "kr";
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
  marketState?: string;
};

type MarketResponse = {
  updatedAt: string;
  source: string;
  items: MarketItem[];
};

const fallbackData: MarketResponse = {
  updatedAt: "",
  source: "sample",
  items: [
    {
      symbol: "USDKRW=X",
      name: "달러/원",
      group: "exchange",
      price: 1368.42,
      change: 3.18,
      changePercent: 0.23,
      currency: "KRW",
      marketState: "실시간",
    },
    {
      symbol: "JPYKRW=X",
      name: "엔/원",
      group: "exchange",
      price: 9.21,
      change: -0.03,
      changePercent: -0.31,
      currency: "KRW",
      marketState: "실시간",
    },
    {
      symbol: "^GSPC",
      name: "S&P 500",
      group: "us",
      price: 6421.25,
      change: 28.8,
      changePercent: 0.45,
      currency: "USD",
      marketState: "장중",
    },
    {
      symbol: "^IXIC",
      name: "NASDAQ",
      group: "us",
      price: 21780.51,
      change: -42.12,
      changePercent: -0.19,
      currency: "USD",
      marketState: "장중",
    },
    {
      symbol: "^DJI",
      name: "DOW",
      group: "us",
      price: 46332.9,
      change: 112.4,
      changePercent: 0.24,
      currency: "USD",
      marketState: "장중",
    },
    {
      symbol: "^KS11",
      name: "KOSPI",
      group: "kr",
      price: 3412.77,
      change: 18.52,
      changePercent: 0.55,
      currency: "KRW",
      marketState: "장중",
    },
    {
      symbol: "^KQ11",
      name: "KOSDAQ",
      group: "kr",
      price: 892.13,
      change: -4.62,
      changePercent: -0.52,
      currency: "KRW",
      marketState: "장중",
    },
  ],
};

const groups = [
  { key: "exchange", title: "실시간 환율", subtitle: "주요 통화 원화 기준" },
  { key: "us", title: "미국 지수", subtitle: "S&P 500, NASDAQ, DOW" },
  { key: "kr", title: "한국 지수", subtitle: "KOSPI, KOSDAQ" },
] as const;

const numberFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function formatTime(value: string) {
  if (!value) {
    return "확인 중";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function MarketCard({ item }: { item: MarketItem }) {
  const isPositive = item.change >= 0;

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{item.symbol}</p>
          <h3 className="mt-1 text-xl font-semibold text-zinc-950">
            {item.name}
          </h3>
        </div>
        <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
          {item.marketState ?? "확인중"}
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tabular-nums text-zinc-950">
            {numberFormatter.format(item.price)}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-500">
            {item.currency ?? "POINT"}
          </p>
        </div>
        <div
          className={`text-right font-semibold tabular-nums ${
            isPositive ? "text-rose-600" : "text-blue-600"
          }`}
        >
          <p>
            {isPositive ? "+" : ""}
            {numberFormatter.format(item.change)}
          </p>
          <p className="text-sm">
            {isPositive ? "+" : ""}
            {item.changePercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [data, setData] = useState<MarketResponse>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMarkets() {
      try {
        const response = await fetch("/api/markets", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("market request failed");
        }

        const nextData = (await response.json()) as MarketResponse;
        if (isMounted) {
          setData(nextData);
          setError("");
        }
      } catch {
        if (isMounted) {
          setData((current) => ({
            ...current,
            updatedAt: new Date().toISOString(),
            source: "sample",
          }));
          setError("실시간 데이터를 불러오지 못해 샘플 시세를 표시 중입니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMarkets();
    const timer = window.setInterval(loadMarkets, 2000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const leadItems = useMemo(() => data.items.slice(0, 3), [data.items]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                MARKET OVERVIEW
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-normal text-zinc-950 sm:text-5xl">
                글로벌 시장 한눈에 보기
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
                환율, 미국 주요 지수, 한국 지수를 한 화면에서 빠르게 확인하는
                투자 체크 페이지입니다.
              </p>
            </div>

            <div className="grid min-w-72 grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <div>
                <p className="text-xs font-medium text-zinc-500">업데이트</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {formatTime(data.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500">상태</p>
                <p className="mt-1 font-semibold">
                  {isLoading
                    ? "연결 중"
                    : data.source === "live"
                      ? "실시간"
                      : "샘플"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {leadItems.map((item) => (
              <div
                key={item.symbol}
                className="rounded-lg bg-zinc-950 p-5 text-white shadow-sm"
              >
                <p className="text-sm font-medium text-zinc-400">{item.name}</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <p className="text-3xl font-bold tabular-nums">
                    {numberFormatter.format(item.price)}
                  </p>
                  <p
                    className={`font-semibold tabular-nums ${
                      item.change >= 0 ? "text-rose-300" : "text-sky-300"
                    }`}
                  >
                    {item.change >= 0 ? "+" : ""}
                    {item.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:px-10">
        {error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {error}
          </div>
        ) : null}

        {groups.map((group) => {
          const items = data.items.filter((item) => item.group === group.key);

          return (
            <div key={group.key}>
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-950">
                    {group.title}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-zinc-500">
                    {group.subtitle}
                  </p>
                </div>
                <p className="text-sm font-medium text-zinc-500">
                  2초마다 자동 갱신
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <MarketCard key={item.symbol} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
