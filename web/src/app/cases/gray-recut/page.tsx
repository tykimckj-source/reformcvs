import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { GrayCaseCompare } from "@/components/gray-case-compare";
import { PatchShop } from "@/components/patch-shop";

export const metadata: Metadata = {
  title: "소매를 다시 재단한 회색 티 · 리폼 편의점",
  description: "소매 원단을 옆구리에 더해 몸판의 폭을 넓힌 회색 티의 앞면과 뒷면 리폼 비교.",
};

export default function GrayRecutCase() {
  return (
    <PhoneFrame>
      <header className="flex items-center justify-between border-b border-line px-5 py-5">
        <Logo small />
        <Link href="/" className="flex min-h-10 items-center gap-1 text-xs font-semibold text-muted"><ArrowLeft size={15} /> 홈으로</Link>
      </header>
      <main className="pb-8">
        <section className="px-5 pb-6 pt-8">
          <p className="text-[11px] font-bold tracking-[.12em] text-[#53634b]">REFORM STORY 03</p>
          <h1 className="mt-4 text-[31px] font-extrabold leading-[1.3] tracking-[-.035em]">소매를 다시 재단해<br />넉넉해진 회색 티</h1>
          <p className="mt-4 text-[14.5px] leading-7 text-muted">소매 원단을 옆구리에 더해 몸판의 폭을 넓혔어요. 달라진 소매와 다채로운 패치, 앞뒤에 담긴 변화를 비교해 보세요.</p>
          <nav aria-label="회색 티 비교 위치" className="mt-5 flex gap-5 text-sm font-semibold"><a href="#front" className="underline underline-offset-4">앞면 비교</a><a href="#back" className="underline underline-offset-4">뒷면 비교 ↓</a></nav>
        </section>
        <section id="front" className="scroll-mt-5 px-5" aria-labelledby="front-title">
          <h2 id="front-title" className="mb-4 text-[23px] font-bold">01. 앞면의 변화</h2>
          <GrayCaseCompare side="front" />
          <a href="#patch-shop" className="mt-3 inline-block min-h-10 text-sm font-semibold underline underline-offset-4">이 사진 속 패치 골라 담기 ↓</a>
          <p className="mt-4 text-[13.5px] leading-6 text-muted">눈 모양과 다양한 컬러 패치로 달라지는 모습을 비교해 보세요. 재단한 소매와 옆구리의 열린 구조가 새로운 실루엣을 만들어요.</p>
        </section>
        <section id="back" className="mt-9 scroll-mt-5 px-5" aria-labelledby="back-title">
          <h2 id="back-title" className="mb-4 text-[23px] font-bold">02. 뒷면의 변화</h2>
          <GrayCaseCompare side="back" />
          <a href="#patch-shop" className="mt-3 inline-block min-h-10 text-sm font-semibold underline underline-offset-4">뒷판 전사지·눈 모양 패치 보기 ↓</a>
          <p className="mt-4 text-[13.5px] leading-6 text-muted">단정했던 등판에 재봉 도구 그림을 더하고, 재단과 연결의 흔적을 디자인으로 살렸어요.</p>
        </section>
        <p className="mx-5 mt-7 border-t border-line pt-5 text-[11px] leading-6 text-muted">제공된 리폼 전후 사진을 바탕으로 배경·주름·색감을 AI로 정리한 비교 이미지입니다. 앞면 비포는 눈 모양 패치를 제거하고 목 안쪽을 연한 회색으로 맞춘 AI 재구성입니다. 어깨와 길이를 기준으로 배치를 맞췄으며, 리폼으로 달라진 몸판 폭과 소매 구조는 비교 대상에 포함됩니다.</p>
        <section className="mx-5 mt-8 rounded-[22px] bg-white p-5" aria-labelledby="price-title">
          <h2 id="price-title" className="text-[23px] font-bold">원하는 만큼 더하는 리폼</h2>
          <p className="mt-3 text-[13.5px] leading-6 text-muted">품을 넓혀 원피스 위에도 어울리는 여성스러운 실루엣으로. 장식은 모두 붙일 필요 없이 원하는 것만, 원하는 위치에 더할 수 있어요.</p>
          <dl className="mt-5 divide-y divide-line text-sm">
            <div className="flex items-center justify-between gap-3 py-4"><dt>디자인 변경</dt><dd className="shrink-0 font-bold">29,000원</dd></div>
            <div className="flex items-center justify-between gap-3 py-4"><dt>자수 패치 <span className="text-xs text-muted">· 선택</span></dt><dd className="shrink-0 font-bold">개당 1,000원</dd></div>
            <div className="flex items-center justify-between gap-3 py-4"><dt>뒷판 전사지 <span className="text-xs text-muted">· 선택</span></dt><dd className="shrink-0 font-bold">3,000원</dd></div>
          </dl>
        </section>
        <PatchShop />
        <nav aria-label="다른 리폼 사례" className="mx-5 mt-6 flex flex-wrap gap-4 text-sm font-semibold"><Link href="/">파란 PK티 보기 →</Link><Link href="/cases/knit-yarn">니트 보기 →</Link></nav>
      </main>
    </PhoneFrame>
  );
}
