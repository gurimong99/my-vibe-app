import { NextResponse } from "next/server";

type PaymentMethod = "paypal" | "card" | "kakao" | "naver";

type PaymentRequest = {
  method?: PaymentMethod;
  amount?: number;
  tax?: number;
  total?: number;
  orderName?: string;
  buyerName?: string;
  buyerEmail?: string;
};

const providerConfig: Record<
  PaymentMethod,
  {
    provider: string;
    nextAction: string;
    envKeys: string[];
    message: string;
  }
> = {
  paypal: {
    provider: "PayPal Checkout",
    nextAction: "PayPal Orders API로 order 생성 후 approve 링크로 이동",
    envKeys: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"],
    message:
      "샌드박스 키를 설정한 뒤 서버에서 PayPal order를 만들고 클라이언트는 승인 URL로 이동합니다.",
  },
  card: {
    provider: "Card PG",
    nextAction: "PG 카드 위젯 또는 카드 토큰화 SDK 호출",
    envKeys: ["PAYMENT_PG_CLIENT_KEY", "PAYMENT_PG_SECRET_KEY"],
    message:
      "실제 카드번호는 서버로 직접 보내지 말고 PG SDK에서 토큰화한 결제키만 승인 API로 전달하세요.",
  },
  kakao: {
    provider: "Kakao Pay",
    nextAction: "카카오페이 결제 준비 API 호출 후 redirect URL로 이동",
    envKeys: ["KAKAO_PAY_CID", "KAKAO_PAY_SECRET_KEY"],
    message:
      "카카오페이 가맹점 키를 설정하면 ready 요청에서 받은 URL로 사용자를 이동시키는 흐름을 붙이면 됩니다.",
  },
  naver: {
    provider: "Naver Pay",
    nextAction: "네이버페이 주문서 생성 후 결제창 URL로 이동",
    envKeys: ["NAVER_PAY_CLIENT_ID", "NAVER_PAY_CLIENT_SECRET"],
    message:
      "네이버페이 가맹점 심사 후 발급된 키로 주문서를 만들고 결제창 URL을 반환하도록 연결하세요.",
  },
};

export async function POST(request: Request) {
  const body = (await request.json()) as PaymentRequest;
  const method = body.method ?? "card";
  const config = providerConfig[method];

  if (!config) {
    return NextResponse.json(
      { error: "Unsupported payment method" },
      { status: 400 },
    );
  }

  const orderId = `TEST-${Date.now()}`;

  return NextResponse.json({
    orderId,
    provider: config.provider,
    status: "READY_MOCK",
    nextAction: config.nextAction,
    redirectUrl: `/checkout/mock-success?orderId=${orderId}`,
    envKeys: config.envKeys,
    message: config.message,
    request: {
      amount: body.amount,
      tax: body.tax,
      total: body.total,
      orderName: body.orderName,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
    },
  });
}
