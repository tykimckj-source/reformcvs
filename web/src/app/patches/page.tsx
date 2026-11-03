import Link from "next/link";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { PatchShop } from "@/components/patch-shop";

export const metadata = { title: "패치 모음 · 리폼 편의점" };

export default function PatchesPage() {
  return <PhoneFrame>
    <header className="flex items-center justify-between border-b border-line px-5 py-5"><Logo small /><Link href="/cases/gray-recut" className="text-sm underline">리폼 사례로</Link></header>
    <main className="pb-10"><div className="px-5 pt-7"><h1 className="text-3xl font-bold">패치 모음</h1><p className="mt-3 text-sm leading-6 text-muted">마음에 드는 패치를 고르고 수량을 선택해 보세요.</p></div><PatchShop catalog /></main>
  </PhoneFrame>;
}
