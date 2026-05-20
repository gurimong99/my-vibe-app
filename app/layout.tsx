import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toss Payment Test",
  description: "토스페이먼츠 결제 테스트 화면",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
