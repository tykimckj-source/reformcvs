import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { IndigoOceanCompare } from "@/components/indigo-ocean-compare";

export const metadata: Metadata = {
  title: "쪽빛으로 다시 입는 바다 · 리폼 편의점",
  description: "이염과 변색이 있던 흰 티셔츠에 쪽염색과 고양이·고래 원단 패치를 더하고, 뒷면에 바다 느낌의 스텐실을 담은 리폼 사례.",
};

export default function IndigoOceanCase() {
  return <PhoneFrame>
    <header className="flex items-center justify-between border-b border-line px-5 py-5">
      <Logo small /><Link href="/" className="flex min-h-10 items-center gap-1 text-xs font-semibold text-muted"><ArrowLeft size={15} /> 홈으로</Link>
    </header>
    <main className="pb-8">
      <section className="px-5 pb-6 pt-8">
        <p className="text-[11px] font-bold tracking-[.12em] text-[#53634b]">REFORM STORY 06</p>
        <h1 className="mt-4 text-[31px] font-extrabold leading-[1.3] tracking-[-.035em]">오래된 흰 티셔츠,<br />쪽빛 바다를 입다</h1>
        <p className="mt-4 text-[14.5px] leading-7 text-muted">여러 곳에 이염과 변색이 생긴 흰 티셔츠. 쪽염색으로 새로운 색을 입히고, 고양이와 고래가 있는 원단 패치로 이야기를 더했어요.</p>
        <nav aria-label="쪽염색 티셔츠 비교 위치" className="mt-5 flex gap-5 text-sm font-semibold"><a href="#front" className="underline underline-offset-4">앞면 비교</a><a href="#back" className="underline underline-offset-4">뒷면 비교 ↓</a></nav>
      </section>
      <section id="front" className="scroll-mt-5 px-5" aria-labelledby="front-title">
        <h2 id="front-title" className="mb-4 text-[23px] font-bold">01. 앞면의 변화</h2>
        <IndigoOceanCompare side="front" />
        <p className="mt-4 text-[13.5px] leading-6 text-muted">쪽빛 사이로 남은 밝은 염색 무늬와 고양이·고래 원단 패치. 옷의 형태는 그대로 두고 색과 장식으로 변화를 주었습니다.</p>
      </section>
      <section id="back" className="mt-9 scroll-mt-5 px-5" aria-labelledby="back-title">
        <h2 id="back-title" className="mb-4 text-[23px] font-bold">02. 뒷면의 변화</h2>
        <IndigoOceanCompare side="back" />
        <p className="mt-4 text-[13.5px] leading-6 text-muted">등판의 원단 패치 주위로 바다를 닮은 스텐실을 더했어요. 스텐실은 뒷면에만 작업해 앞면과는 다른 풍경을 담았습니다.</p>
      </section>
      <section className="mx-5 mt-8 rounded-[22px] bg-white p-5" aria-labelledby="technique-title">
        <h2 id="technique-title" className="text-[23px] font-bold">이번 리폼에 사용한 기법</h2>
        <div className="mt-4 flex flex-wrap gap-2">{["쪽염색", "고양이·고래 원단 패치", "뒷면 바다 스텐실"].map(technique => <span key={technique} className="rounded-full border border-line px-3 py-2 text-sm">{technique}</span>)}</div>
        <p className="mt-4 text-[13.5px] leading-6 text-muted">목둘레, 어깨, 소매 길이와 전체 크기를 바꾸지 않은 리폼입니다. 앞뒤 비교 사진도 같은 크기와 위치로 배치했습니다.</p>
      </section>
      <nav aria-label="다른 리폼 사례" className="mx-5 mt-6 flex flex-wrap gap-4 text-sm font-semibold"><Link href="/">파란 PK티 →</Link><Link href="/cases/knit-yarn">니트 →</Link><Link href="/cases/gray-recut">회색 티 →</Link><Link href="/cases/white-stamp">흰색 남방 →</Link><Link href="/cases/denim-skirt">청치마 →</Link></nav>
    </main>
  </PhoneFrame>;
}
