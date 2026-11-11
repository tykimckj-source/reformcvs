import Link from "next/link";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { TransferSweatshirtCompare } from "@/components/transfer-sweatshirt-compare";
import { PatchShop } from "@/components/patch-shop";

export const metadata = { title: "이염 위에 더한 작은 그림 · 리폼 편의점", description: "흰 맨투맨의 이염을 전사 모티프로 가린 리폼 이야기와 전사지 3종." };

export default function TransferSweatshirtCase() {
  return <PhoneFrame>
    <header className="flex items-center justify-between border-b border-line px-5 py-5"><Logo small /><Link href="/" className="text-sm underline">홈으로</Link></header>
    <main className="pb-8">
      <section className="px-5 pb-6 pt-8">
        <p className="text-[11px] font-bold tracking-widest text-[#53634b]">REFORM STORY 08</p>
        <h1 className="mt-4 text-[31px] font-extrabold leading-[1.3]">이염 위에 더한<br />작은 그림들</h1>
        <p className="mt-4 text-sm leading-7 text-muted">흰 맨투맨에 남은 이염을 전사지의 모양을 하나씩 떼어 붙여 가렸어요. 조개와 돌고래, 꽃과 나뭇잎이 모여 옷에 새로운 즐거움을 더합니다.</p>
        <a href="#patch-shop" className="mt-4 inline-block text-sm font-semibold underline">전사지 3종 보기 ↓</a>
      </section>
      <section className="px-5" aria-label="맨투맨 전사 장식 전후 비교">
        <TransferSweatshirtCompare side="front" />
        <p className="mt-3 text-xs leading-6 text-muted">비교를 위한 AI 재현 이미지입니다. 애프터는 제공 사진을 평면으로 정리했고, 비포는 장식을 제거해 재현했습니다. 실제 이염의 위치와 상태를 기록한 비포 사진은 아닙니다. 실제 장식의 세부 표현과 차이가 있을 수 있습니다.</p>
      </section>
      <PatchShop transferOnly />
    </main>
  </PhoneFrame>;
}
