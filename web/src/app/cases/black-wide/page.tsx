import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { BlackWideCompare } from "@/components/black-wide-compare";

export const metadata: Metadata = {
  title: "블랙 팬츠에 더한 여유와 바다 · 리폼 편의점",
  description: "블랙 팬츠의 엉덩이와 허벅지부터 밑단까지 폭을 넓히고 블루 스텐실과 뒷주머니 스톤 장식을 더한 리폼 사례.",
};

export default function BlackWideCase() {
  return <PhoneFrame>
    <header className="flex items-center justify-between border-b border-line px-5 py-5">
      <Logo small /><Link href="/" className="flex min-h-10 items-center gap-1 text-xs font-semibold text-muted"><ArrowLeft size={15} /> 홈으로</Link>
    </header>
    <main className="pb-8">
      <section className="px-5 pb-6 pt-8">
        <p className="text-[11px] font-bold tracking-[.12em] text-[#53634b]">REFORM STORY 07</p>
        <h1 className="mt-4 text-[31px] font-extrabold leading-[1.3] tracking-[-.035em]">블랙 팬츠에 더한<br />여유와 바다</h1>
        <p className="mt-4 text-[14.5px] leading-7 text-muted">익숙한 블랙 팬츠를 넉넉한 실루엣으로. 엉덩이와 허벅지에 여유를 주고 밑단까지 폭을 넓혀, 지금 입고 싶은 스타일로 바꿨어요.</p>
        <nav aria-label="블랙 팬츠 비교 위치" className="mt-5 flex gap-5 text-sm font-semibold"><a href="#front" className="underline underline-offset-4">앞면 비교</a><a href="#back" className="underline underline-offset-4">뒷면 비교 ↓</a></nav>
      </section>
      <section id="front" className="scroll-mt-5 px-5" aria-labelledby="front-title">
        <h2 id="front-title" className="mb-4 text-[23px] font-bold">01. 앞면의 변화</h2>
        <BlackWideCompare side="front" />
        <p className="mt-4 text-[13.5px] leading-6 text-muted">옆면에 더한 블루 계열 원단으로 허벅지부터 밑단까지 넓어지는 라인을 만들었어요. 바닷물을 닮은 스텐실을 비대칭으로 배치해 새로운 표정을 더했습니다.</p>
      </section>
      <section id="back" className="mt-9 scroll-mt-5 px-5" aria-labelledby="back-title">
        <h2 id="back-title" className="mb-4 text-[23px] font-bold">02. 뒷면의 변화</h2>
        <BlackWideCompare side="back" />
        <p className="mt-4 text-[13.5px] leading-6 text-muted">엉덩이 부분에도 여유를 더하고, 앞면과 다르게 놓인 블루 스텐실로 뒷모습을 완성했어요. 두 뒷주머니에는 반짝이는 스톤을 붙여 작은 포인트를 주었습니다.</p>
      </section>
      <section className="mx-5 mt-8 rounded-[22px] bg-white p-5" aria-labelledby="technique-title">
        <h2 id="technique-title" className="text-[23px] font-bold">이번 리폼에 사용한 기법</h2>
        <div className="mt-4 flex flex-wrap gap-2">{["옆면 원단 재구성", "엉덩이·바지통 확장", "블루 스텐실", "주머니 스톤 장식"].map(technique => <span key={technique} className="rounded-full border border-line px-3 py-2 text-sm">{technique}</span>)}</div>
        <p className="mt-4 text-[13.5px] leading-6 text-muted">바지통과 엉덩이의 여유를 늘리는 형태 변화에 장식을 함께 더한 작업입니다. 제공해 주신 앞뒤 사진으로 넓어진 실루엣과 장식의 차이를 비교해 보세요.</p>
      </section>
      <nav aria-label="다른 리폼 사례" className="mx-5 mt-6 flex flex-wrap gap-4 text-sm font-semibold"><Link href="/">파란 PK티 →</Link><Link href="/cases/knit-yarn">니트 →</Link><Link href="/cases/gray-recut">회색 티 →</Link><Link href="/cases/white-stamp">흰색 남방 →</Link><Link href="/cases/denim-skirt">청치마 →</Link></nav>
    </main>
  </PhoneFrame>;
}
