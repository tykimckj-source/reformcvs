import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { DenimSkirtCompare } from "@/components/denim-skirt-compare";

export const metadata: Metadata = {
  title: "바지 두 벌, 하나의 청치마 · 리폼 편의점",
  description: "바지 두 벌을 재구성한 청치마의 앞면과 뒷면을 비포·애프터로 비교해 보세요.",
};

export default function DenimSkirtCase() {
  return <PhoneFrame>
    <header className="flex items-center justify-between border-b border-line px-5 py-5"><Logo small /><Link href="/" className="flex min-h-10 items-center gap-1 text-xs font-semibold text-muted"><ArrowLeft size={15} /> 홈으로</Link></header>
    <main className="pb-8">
      <section className="px-5 pb-6 pt-8">
        <p className="text-[11px] font-bold tracking-[.12em] text-[#53634b]">REFORM STORY 05</p>
        <h1 className="mt-4 text-[31px] font-extrabold leading-[1.3] tracking-[-.035em]">바지 두 벌,<br />하나의 청치마</h1>
        <p className="mt-4 text-[14.5px] leading-7 text-muted">입던 바지 두 벌을 다시 구성해 긴 청치마로 만들었어요. 서로 다른 원단의 표정과 연결선, 자수와 반짝이는 장식이 한 벌에 담겼습니다.</p>
        <nav aria-label="청치마 보기" className="mt-5 flex gap-5 text-sm font-semibold"><a href="#front" className="underline underline-offset-4">앞면</a><a href="#back" className="underline underline-offset-4">뒷면</a></nav>
      </section>
      <section className="mx-5 mb-7 rounded-2xl border border-line bg-white p-4" aria-label="리폼 전 사진 안내">
        <p className="text-xs font-semibold text-[#53634b]">BEFORE → AFTER</p>
        <p className="mt-2 text-sm font-semibold">바지 두 벌 → 긴 청치마 한 벌</p>
        <p className="mt-2 text-xs leading-6 text-muted">허리둘레는 그대로, 엉덩이부터 넓어지는 청치마로. 밑단 프릴만큼 길어진 모습까지 앞뒤 비교 막대로 확인해 보세요.</p>
      </section>
      <section id="front" className="scroll-mt-5 px-5" aria-labelledby="front-title">
        <h2 id="front-title" className="mb-4 text-[23px] font-bold">01. 앞면의 변화</h2>
        <DenimSkirtCompare side="front" />
        <p className="mt-4 text-[13.5px] leading-6 text-muted">허리와 앞주머니를 살리고, 중앙에 밝은 원단을 연결했어요. 밑으로 넓어지는 실루엣과 원단의 대비가 돋보입니다.</p>
      </section>
      <section id="back" className="mt-9 scroll-mt-5 px-5" aria-labelledby="back-title">
        <h2 id="back-title" className="mb-4 text-[23px] font-bold">02. 뒷면의 변화</h2>
        <DenimSkirtCompare side="back" />
        <p className="mt-4 text-[13.5px] leading-6 text-muted">바지의 뒷주머니와 봉제선을 남기고, 등쪽 중앙에도 원단을 이어 치마의 폭을 만들었어요. 주머니와 밑단의 장식까지 살펴보세요.</p>
      </section>
      <nav aria-label="다른 리폼 사례" className="mx-5 mt-8 flex flex-wrap gap-4 text-sm font-semibold"><Link href="/">파란 PK티 →</Link><Link href="/cases/knit-yarn">니트 →</Link><Link href="/cases/gray-recut">회색 티 →</Link><Link href="/cases/white-stamp">흰색 남방 →</Link></nav>
    </main>
  </PhoneFrame>;
}
