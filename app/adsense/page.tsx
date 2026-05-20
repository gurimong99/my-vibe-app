import Link from "next/link";
import Script from "next/script";

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const adsenseSlot = process.env.NEXT_PUBLIC_ADSENSE_TEST_SLOT;

const demoArticles = [
  {
    title: "페이지 상단 자동 광고 영역",
    body: "실제 연결 전에는 레이아웃 밀림, 광고 주변 여백, 본문 가독성을 먼저 확인합니다.",
  },
  {
    title: "콘텐츠 중간 배너 테스트",
    body: "본문 흐름을 해치지 않는 위치에 디스플레이 광고 슬롯이 들어가는지 확인하는 구간입니다.",
  },
  {
    title: "모바일 대응 확인",
    body: "반응형 슬롯은 화면 폭에 따라 높이와 노출 형식이 달라질 수 있어 모바일 점검이 중요합니다.",
  },
];

export default function AdsenseTestPage() {
  const canRenderAdTag = Boolean(adsenseClient && adsenseSlot);

  return (
    <>
      {adsenseClient && (
        <Script
          id="adsense-loader"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
        />
      )}
      <main className="min-h-screen bg-[#f6f8fb] text-zinc-950">
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-700">
                ADSENSE TEST
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-normal">
                구글 애드센스 테스트 페이지
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
                광고 코드가 들어갔을 때 페이지 구조가 자연스럽게 유지되는지
                확인하는 테스트 화면입니다.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex shrink-0 rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-bold text-zinc-800 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              결제 테스트로 돌아가기
            </Link>
          </div>
        </section>

        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1fr_300px]">
          <section className="grid gap-6">
            <AdSlot
              label="상단 반응형 광고"
              canRenderAdTag={canRenderAdTag}
              format="auto"
            />

            {demoArticles.map((article, index) => (
              <article
                key={article.title}
                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-bold text-zinc-500">
                  TEST ARTICLE {index + 1}
                </p>
                <h2 className="mt-2 text-xl font-bold">{article.title}</h2>
                <p className="mt-3 leading-7 text-zinc-600">{article.body}</p>
                {index === 0 && (
                  <div className="mt-6">
                    <AdSlot
                      label="본문 중간 광고"
                      canRenderAdTag={canRenderAdTag}
                      format="fluid"
                    />
                  </div>
                )}
              </article>
            ))}
          </section>

          <aside className="grid gap-6 self-start">
            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">연결 상태</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-zinc-500">클라이언트 ID</dt>
                  <dd className="text-right font-semibold">
                    {adsenseClient ? "설정됨" : "미설정"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-zinc-500">광고 슬롯</dt>
                  <dd className="text-right font-semibold">
                    {adsenseSlot ? "설정됨" : "미설정"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-zinc-500">테스트 모드</dt>
                  <dd className="text-right font-semibold">adtest=on</dd>
                </div>
              </dl>
            </section>

            <AdSlot
              label="사이드바 광고"
              canRenderAdTag={canRenderAdTag}
              format="rectangle"
            />
          </aside>
        </div>
      </main>
    </>
  );
}

function AdSlot({
  label,
  canRenderAdTag,
  format,
}: {
  label: string;
  canRenderAdTag: boolean;
  format: "auto" | "fluid" | "rectangle";
}) {
  const minHeight = format === "rectangle" ? "min-h-[250px]" : "min-h-[120px]";

  if (!canRenderAdTag) {
    return (
      <div
        className={`grid ${minHeight} place-items-center rounded-lg border border-dashed border-zinc-300 bg-white p-5 text-center shadow-sm`}
      >
        <div>
          <p className="text-sm font-bold text-zinc-500">{label}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            `NEXT_PUBLIC_ADSENSE_CLIENT`와 `NEXT_PUBLIC_ADSENSE_TEST_SLOT`을
            설정하면 실제 AdSense 태그 형태로 렌더링됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-zinc-200 bg-white p-4 shadow-sm`}>
      <p className="mb-3 text-xs font-bold text-zinc-500">{label}</p>
      <ins
        className={`adsbygoogle block ${minHeight}`}
        style={{ display: "block" }}
        data-ad-client={adsenseClient}
        data-ad-slot={adsenseSlot}
        data-ad-format={format === "rectangle" ? "auto" : format}
        data-full-width-responsive="true"
        data-adtest="on"
      />
      <Script id={`adsense-push-${label}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
