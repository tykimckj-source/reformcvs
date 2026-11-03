import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { WhiteStampCompare } from "@/components/white-stamp-compare";

export const metadata: Metadata = {
  title: "흰색 남방에 피어난 나비와 꽃 · 리폼 편의점",
  description: "나비·꽃 스탬프와 스텐실로 리폼한 흰색 남방의 앞면과 뒷면 비포 애프터 비교.",
};

export default function WhiteStampCase() {
  return <PhoneFrame>
    <header className="flex items-center justify-between border-b border-line px-5 py-5">
      <Logo small /><Link href="/" className="flex min-h-10 items-center gap-1 text-xs font-semibold text-muted"><ArrowLeft size={15} /> 홈으로</Link>
    </header>
    <main className="pb-8">
      <section className="px-5 pb-6 pt-8">
        <p className="text-[11px] font-bold tracking-[.12em] text-[#53634b]">REFORM STORY 04</p>
        <h1 className="mt-4 text-[31px] font-extrabold leading-[1.3] tracking-[-.035em]">흰색 남방에 피어난<br />나비와 꽃</h1>
        <p className="mt-4 text-[14.5px] leading-7 text-muted">단정한 흰색 남방 위에 나비와 꽃을 담았어요. 스탬프와 스텐실을 함께 사용해 앞면부터 뒷면까지 새로운 표정을 더했습니다.</p>
        <nav aria-label="흰색 남방 비교 위치" className="mt-5 flex gap-5 text-sm font-semibold"><a href="#front" className="underline underline-offset-4">앞면 비교</a><a href="#back" className="underline underline-offset-4">뒷면 비교 ↓</a></nav>
      </section>
      <section id="front" className="scroll-mt-5 px-5" aria-labelledby="front-title">
        <h2 id="front-title" className="mb-4 text-[23px] font-bold">01. 앞면의 변화</h2>
        <WhiteStampCompare side="front" />
        <p className="mt-4 text-[13.5px] leading-6 text-muted">칼라와 가슴, 소매와 밑단에 놓인 나비와 꽃. 흰 바탕의 여백 사이로 섬세한 무늬가 이어집니다.</p>
      </section>
      <section id="back" className="mt-9 scroll-mt-5 px-5" aria-labelledby="back-title">
        <h2 id="back-title" className="mb-4 text-[23px] font-bold">02. 뒷면의 변화</h2>
        <WhiteStampCompare side="back" />
        <p className="mt-4 text-[13.5px] leading-6 text-muted">어깨에서 등판으로 날아드는 나비, 밑단에 모인 꽃무늬. 뒷모습에도 앞면과 이어지는 이야기를 담았어요.</p>
      </section>
      <section className="mx-5 mt-8 rounded-[22px] bg-white p-5" aria-labelledby="technique-title">
        <h2 id="technique-title" className="text-[23px] font-bold">이번 리폼에 사용한 기법</h2>
        <div className="mt-4 flex flex-wrap gap-2">{["나비 스탬프", "나비 스텐실", "꽃 스탬프", "꽃 스텐실"].map(technique => <span key={technique} className="rounded-full border border-line px-3 py-2 text-sm">{technique}</span>)}</div>
        <p className="mt-4 text-[13.5px] leading-6 text-muted">스탬프로 찍은 무늬와 스텐실로 표현한 무늬를 조합한 작업입니다. 앞뒤 비교 막대로 장식 전후의 변화를 살펴보세요.</p>
      </section>
      <p className="mx-5 mt-6 text-xs leading-6 text-muted">제공해 주신 앞뒤 사진 네 장을 그대로 사용했습니다. 비교 화면에서 사진의 비율과 무늬를 유지했습니다.</p>
      <nav aria-label="다른 리폼 사례" className="mx-5 mt-6 flex flex-wrap gap-4 text-sm font-semibold"><Link href="/">파란 PK티 →</Link><Link href="/cases/knit-yarn">니트 →</Link><Link href="/cases/gray-recut">회색 티 →</Link></nav>
    </main>
  </PhoneFrame>;
}
