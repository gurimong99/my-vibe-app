import { NextResponse } from "next/server";

type MarketGroup = "exchange" | "us" | "kr";

type QuoteConfig = {
  symbol: string;
  name: string;
  group: MarketGroup;
};

type YahooQuote = {
  meta?: {
    regularMarketPrice?: number;
    chartPreviousClose?: number;
    previousClose?: number;
    currency?: string;
    marketState?: string;
  };
};

const quotes: QuoteConfig[] = [
  { symbol: "USDKRW=X", name: "달러/원", group: "exchange" },
  { symbol: "JPYKRW=X", name: "엔/원", group: "exchange" },
  { symbol: "EURKRW=X", name: "유로/원", group: "exchange" },
  { symbol: "^GSPC", name: "S&P 500", group: "us" },
  { symbol: "^IXIC", name: "NASDAQ", group: "us" },
  { symbol: "^DJI", name: "DOW", group: "us" },
  { symbol: "^KS11", name: "KOSPI", group: "kr" },
  { symbol: "^KQ11", name: "KOSDAQ", group: "kr" },
];

function normalizeMarketState(state?: string) {
  switch (state) {
    case "REGULAR":
      return "장중";
    case "PRE":
      return "프리";
    case "POST":
      return "애프터";
    case "CLOSED":
      return "마감";
    default:
      return "확인중";
  }
}

async function fetchQuote(config: QuoteConfig) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    config.symbol,
  )}?range=1d&interval=1m`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${config.symbol}`);
  }

  const payload = (await response.json()) as {
    chart?: { result?: YahooQuote[] };
  };
  const meta = payload.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  const previousClose = meta?.chartPreviousClose ?? meta?.previousClose;

  if (typeof price !== "number" || typeof previousClose !== "number") {
    throw new Error(`Invalid quote ${config.symbol}`);
  }

  const change = price - previousClose;

  return {
    ...config,
    price,
    change,
    changePercent: previousClose === 0 ? 0 : (change / previousClose) * 100,
    currency: meta?.currency,
    marketState: normalizeMarketState(meta?.marketState),
  };
}

export async function GET() {
  try {
    const settled = await Promise.allSettled(quotes.map(fetchQuote));
    const items = settled
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    if (items.length < 4) {
      throw new Error("Not enough market data");
    }

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      source: "live",
      items,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load market data" },
      { status: 503 },
    );
  }
}
