import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { PatchShop } from "@/components/patch-shop";

export const metadata = { title: "작업자용 패치 편집 · 리폼 편의점", robots: { index: false, follow: false } };

export default function PatchEditorPage() {
  // Local drafting only. Never expose an unauthenticated publishing UI in production.
  if (process.env.NODE_ENV !== "development") notFound();
  return <PhoneFrame>
    <header className="flex items-center justify-between border-b border-line px-5 py-5"><Logo small /><Link href="/admin" className="text-sm underline">운영 콘솔</Link></header>
    <main className="pb-10"><div className="px-5 pt-7">
      <h1 className="text-2xl font-bold">작업자용 패치 편집</h1>
      <p className="mt-3 text-sm leading-6 text-muted">상품 사진·이름·가격을 준비하고 아래에서 미리 확인하세요. 저장은 초안이며, 고객 목록에 자동 공개되지 않습니다.</p>
      <Link href="/patches" className="mt-3 inline-block text-sm underline">고객용 패치 모음 보기</Link>
    </div><PatchShop catalog editor /></main>
  </PhoneFrame>;
}
