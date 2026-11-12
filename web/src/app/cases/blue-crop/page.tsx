import type { Metadata } from "next";
import Link from "next/link";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { BlueCropCompare } from "@/components/blue-crop-compare";

export const metadata: Metadata = {
  title: "파란 PK티, 짧은 레이어드 조끼로 · 리폼 편의점",
  description: "소매를 잘라내고 길이를 짧게 줄여 티셔츠나 원피스 위에 걸쳐 입는 크롭 조끼로 리폼했어요.",
};

export default function BlueCropCase() {
  return <PhoneFrame>
    <header className="flex items-center justify-between border-b border-line px-5 py-5">
      <Logo small /><Link href="/" className="text-sm font-semibold">← 홈으로</Link>
    </header>
    <main className="px-5 pb-8">
      <section className="py-8">
        <p className="text-xs font-bold text-accent">파란 PK티 시리즈</p>
        <h1 className="mt-4 text-[31px] font-extrabold leading-tight">소매는 덜고, 길이는 짧게<br />가볍게 걸치는 크롭 조끼</h1>
        <p className="mt-4 text-sm leading-7 text-muted">소매를 잘라내고 몸판 길이를 과감하게 줄였어요. 티셔츠나 원피스 위에 걸쳐 입는 짧은 레이어드 조끼입니다. 바코드 무늬와 인물 장식, 잘라낸 밑단이 새로운 표정을 만들어요.</p>
        <nav className="mt-4 flex gap-5 text-sm font-semibold" aria-label="비교 위치"><a href="#front">앞면 비교 ↓</a><a href="#back">뒷면 비교 ↓</a></nav>
      </section>
      <section id="front" aria-labelledby="front-title">
        <h2 id="front-title" className="mb-4 text-[23px] font-bold">01. 앞면의 변화</h2>
        <BlueCropCompare side="front" />
      </section>
      <section id="back" className="mt-8" aria-labelledby="back-title">
        <h2 id="back-title" className="mb-4 text-[23px] font-bold">02. 뒷면의 변화</h2>
        <BlueCropCompare side="back" />
      </section>
      <p className="mt-6 text-xs leading-6 text-muted">애프터는 첨부 사진을 바탕으로 색상과 에리 크기를 조정한 평면화 이미지입니다. 기존 비포의 파란색을 기준으로 맞췄으며, 소매 절개와 짧아진 길이를 비교할 수 있어요. 뒷면 비포는 AI 재현 이미지입니다.</p>
    </main>
  </PhoneFrame>;
}
