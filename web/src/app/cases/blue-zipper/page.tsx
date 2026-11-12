import Link from "next/link";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { BlueZipperCompare } from "@/components/blue-zipper-compare";
export const metadata = { title: "파란 PK티, 지퍼로 새롭게 · 리폼 편의점" };
export default function BlueZipperCase() {
 return <PhoneFrame>
  <header className="flex items-center justify-between border-b border-line px-5 py-5"><Logo small /><Link href="/" className="text-sm">홈으로</Link></header>
  <main className="px-5 pb-8">
   <section className="pb-6 pt-8"><p className="text-xs font-bold text-muted">REFORM STORY 09</p><h1 className="mt-4 text-[31px] font-extrabold leading-tight">익숙한 파란 PK티,<br />지퍼로 새롭게</h1><p className="mt-4 text-sm leading-7 text-muted">‘대한민국 사회적가치 페스타’ 로고가 있는 같은 파란 PK티로 만든 6가지 리폼 버전 중 지퍼 버전이에요. 에리는 살리고 지퍼와 컬러 테이프로 새로운 디자인을 더했어요. 길이는 약 10cm 줄여 가볍고 경쾌하게 완성했습니다.</p><nav className="mt-5 flex gap-5 text-sm font-semibold"><a href="#front">앞면 비교 ↓</a><a href="#back">뒷면 비교 ↓</a></nav></section>
   <section id="front" className="scroll-mt-5"><h2 className="mb-4 text-2xl font-bold">01. 앞면의 변화</h2><BlueZipperCompare side="front" /><p className="mt-4 text-sm leading-6 text-muted">애프터는 생성 이미지의 원래 비율로 표시합니다. 어깨와 몸판을 따라 더한 지퍼, 컬러 테이프와 짧아진 밑단이 옷의 분위기를 바꿉니다.</p></section>
   <section id="back" className="mt-9 scroll-mt-5"><h2 className="mb-4 text-2xl font-bold">02. 뒷면의 변화</h2><BlueZipperCompare side="back" /><p className="mt-4 text-sm leading-6 text-muted">등 중앙의 컬러 테이프와 양옆 지퍼가 뒷모습에도 이어집니다.</p><p className="mt-3 text-xs leading-6 text-muted">뒷면 비포는 원본 앞면을 참고한 AI 재현 이미지이며 실제 리폼 전 사진이 아닙니다. 애프터는 제공 사진의 파란 원단 색감을 비포 기준으로 AI 보정한 이미지로, 세부 표현에 차이가 있을 수 있습니다. 촬영 자세가 달라 외곽선에는 차이가 있으며, 약 10cm 단축은 실제 작업 설명이며 화면에서 정확한 실측 비교는 어렵습니다.</p></section>
   <section className="mt-8 rounded-2xl bg-white p-5"><h2 className="text-xl font-bold">하나의 파란 PK티, 여섯 가지 변화</h2><p className="mt-3 text-sm leading-6 text-muted">같은 파란색과 가슴 로고가 있는 비포를 기준으로 이어갑니다. 현재 세 가지 버전을 볼 수 있어요.</p><nav className="mt-4 flex flex-wrap gap-3 text-sm"><Link href="/" className="rounded-full border border-line px-3 py-2">페인팅·리벳 버전 →</Link><span aria-current="page" className="rounded-full bg-accent-soft px-3 py-2">지퍼 버전 · 현재</span><Link href="/cases/blue-eye" className="rounded-full border border-line px-3 py-2">눈 모양 패치 버전 →</Link></nav><p className="mt-3 text-xs text-muted">나머지 세 가지 버전은 사진을 받아 차례로 추가합니다.</p></section>
  </main>
 </PhoneFrame>;
}
