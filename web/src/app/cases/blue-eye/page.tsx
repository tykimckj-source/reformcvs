import Link from "next/link";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { BlueEyeCompare } from "@/components/blue-eye-compare";
export const metadata = { title: "파란 PK티에 담은 작은 시선들 · 리폼 편의점" };
export default function BlueEyeCase() {
 return <PhoneFrame><header className="flex items-center justify-between border-b border-line px-5 py-5"><Logo small /><Link href="/" className="text-sm">홈으로</Link></header>
 <main className="px-5 pb-8"><section className="pb-6 pt-8"><p className="text-xs font-bold text-muted">REFORM STORY 10 · 파란 PK티 시리즈</p><h1 className="mt-4 text-[31px] font-extrabold leading-tight">파란 PK티에 담은<br />작은 시선들</h1><p className="mt-4 text-sm leading-7 text-muted">같은 ‘대한민국 사회적가치 페스타’ 파란 PK티의 또 다른 변화. 눈 모양 장식과 스티치, 에리와 소매의 무늬 테두리, 고무줄 밑단으로 새로운 표정을 더했어요.</p><nav className="mt-5 flex gap-5 text-sm font-semibold"><a href="#front">앞면 비교 ↓</a><a href="#back">뒷면 비교 ↓</a></nav></section>
 <section id="front" className="scroll-mt-5"><h2 className="mb-4 text-2xl font-bold">01. 앞면의 변화</h2><BlueEyeCompare side="front" /><p className="mt-4 text-sm leading-6 text-muted">다채로운 눈 모양 장식과 초록색 스티치가 이어지고, 가슴에는 밤하늘을 닮은 원단 장식이 놓였어요.</p></section>
 <section id="back" className="mt-9 scroll-mt-5"><h2 className="mb-4 text-2xl font-bold">02. 뒷면의 변화</h2><BlueEyeCompare side="back" /><p className="mt-4 text-sm leading-6 text-muted">등 위쪽의 하트와 눈, 레터링과 얼룩말 장식이 뒷모습의 포인트예요. 에리·소매 테두리와 고무줄 밑단도 이어집니다.</p></section>
 <p className="mt-5 text-xs leading-6 text-muted">애프터는 제공된 앞뒤 사진을 바탕으로 AI가 평면으로 정리한 이미지입니다. 장식의 세부 표현에는 차이가 있을 수 있습니다. 앞면 비포는 첫 페이지와 같은 사진이며, 뒷면 비포는 AI 재현 이미지입니다. 화면상 비율은 실측 비교가 아닙니다.</p>
 <section className="mt-8 rounded-2xl bg-white p-5"><h2 className="text-xl font-bold">하나의 파란 PK티, 여섯 가지 변화</h2><p className="mt-3 text-sm text-muted">현재 세 가지 버전을 볼 수 있어요.</p><nav className="mt-4 flex flex-wrap gap-3 text-sm"><Link href="/" className="rounded-full border border-line px-3 py-2">페인팅·리벳 →</Link><Link href="/cases/blue-zipper" className="rounded-full border border-line px-3 py-2">지퍼 →</Link><span aria-current="page" className="rounded-full bg-accent-soft px-3 py-2">눈 모양 패치 · 현재</span></nav></section>
 </main></PhoneFrame>;
}
