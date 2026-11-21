import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PreviewVersions } from "@/components/preview-versions";

export const metadata: Metadata = {
  title: "리폼 편의점 · 홈페이지 시안 비교",
  description: "기존 홈페이지와 흰티 리폼 찾기를 비교하는 미리보기",
  // 클라이언트 시연용이라 검색엔진에 노출하지 않는다
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f4ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body><aside style={{ background: "#f0e7f4", color: "#514258", padding: "9px 16px", textAlign: "center", fontSize: 12, lineHeight: 1.7 }}>미리보기 전용 · AI 합성·주문·결제·택배 접수는 운영하지 않습니다. 기존 체험 화면도 시연용입니다.</aside><PreviewVersions />{children}</body>
    </html>
  );
}
