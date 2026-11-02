import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { KnitCaseCompare } from "@/components/knit-case-compare";

export const metadata: Metadata = {
  title: "보풀난 니트에 더한 털실의 표정 · 리폼 편의점",
  description: "털실 장식과 색실 스티치로 보풀이 시각적으로 덜 도드라지도록 리폼한 니트 베스트의 실제 작업 사례.",
};

export default function KnitYarnCase() {
  return (
    <PhoneFrame>
      <header className="flex items-center justify-between border-b border-line px-5 py-5">
        <Logo small />
        <Link href="/" className="flex min-h-10 items-center gap-1 text-xs font-semibold text-muted"><ArrowLeft size={15} /> 홈으로</Link>
      </header>
      <main>
        <section className="px-5 pb-6 pt-8">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[.12em] text-[#53634b]"><span className="h-px w-6 bg-[#53634b]" /> REFORM STORY 02</div>
          <h1 className="mt-4 text-[31px] font-extrabold leading-[1.3] tracking-[-.035em]">보풀난 니트에<br />털실로 더한 새로운 표정</h1>
          <p className="mt-4 text-[14.5px] leading-7 text-muted">보풀이 눈에 띄던 니트 베스트.<br />다양한 털실의 질감과 색을 더해,<br />표면의 보풀이 덜 도드라져 보이도록 리폼했어요.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["니트 베스트", "털실 장식", "색실 스티치"].map((tag) => <span key={tag} className="rounded-full border border-[#d5dbcd] px-3 py-1.5 text-xs text-[#53634b]">{tag}</span>)}
          </div>
        </section>

        <div className="px-5"><KnitCaseCompare /></div>

        <section className="mx-5 mt-9 border-y border-line py-7" aria-labelledby="change-title">
          <p className="text-[11px] font-bold tracking-[.15em] text-[#53634b]">BEFORE → AFTER</p>
          <h2 id="change-title" className="mt-2 text-[23px] font-bold tracking-tight">이 옷은 이렇게 달라졌어요</h2>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl bg-[#eeeae3] p-5">
              <p className="text-xs font-bold text-muted">BEFORE · 리폼 전 상태</p>
              <p className="mt-2 text-[16px] font-semibold">표면의 보풀이 눈에 띄던 니트</p>
              <p className="mt-2 text-[13px] leading-6 text-muted">작업자가 설명한 리폼 전 상태입니다. 비교 이미지의 비포는 옷의 형태를 유지하고 장식을 제거해 AI로 재구성한 예상 모습이에요.</p>
            </div>
            <div className="rounded-2xl bg-[#e7ecdf] p-5">
              <p className="text-xs font-bold text-[#53634b]">AFTER · 실제 완성 모습</p>
              <p className="mt-2 text-[16px] font-semibold">털실의 입체감과 색으로 시선을 옮기다</p>
              <p className="mt-2 text-[13px] leading-6 text-[#53634b]">꽃과 줄기를 닮은 장식, 서로 다른 털실의 질감, 가느다란 색실의 흐름으로 보풀이 시각적으로 덜 도드라지게 했어요.</p>
            </div>
          </div>
        </section>

        <div className="mx-5 mt-8"><Link href="/cases/gray-recut" className="text-sm font-semibold underline underline-offset-4">다음 사례 · 회색 티의 앞면과 뒷면 비교 →</Link></div>
        <section className="mx-5 mb-8 mt-10 rounded-[24px] bg-[#293e32] p-6 text-white">
          <p className="text-xs tracking-wider text-[#c9d7c1]">다시 입는 즐거움</p>
          <h2 className="mt-3 text-[23px] font-bold leading-snug">오래 입은 흔적 위에<br />나만의 이야기를 더해요.</h2>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#293e32]">다른 리폼 사례 보기 <ArrowUpRight size={16} /></Link>
        </section>
      </main>
    </PhoneFrame>
  );
}
