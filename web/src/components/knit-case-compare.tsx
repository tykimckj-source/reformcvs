"use client";

import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

export function KnitCaseCompare() {
  const [split, setSplit] = useState(50);
  return (
    <figure>
      <div className="relative isolate aspect-square overflow-hidden rounded-[22px] bg-white">
        {/* Both layers use the same full-frame coordinates so changing the split never resizes the garment. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cases/knit-yarn/after-long.png" alt="실제 리폼 사진을 바탕으로 흰 배경에 펼친 모습으로 AI 연출한 니트" className="absolute inset-0 h-full w-full object-contain" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cases/knit-yarn/before-long-pilling.png" alt="AI로 재구성한 리폼 전 예상 모습: 작은 보풀이 있는 밝은 크림 베이지색 니트" className="h-full w-full object-contain" />
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-3 py-2 text-[11px] font-semibold text-white">비포 · AI 재구성</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#53634b] px-3 py-2 text-[11px] font-semibold text-white">애프터 · AI 연출</span>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-sm" style={{ left: `${split}%` }} />
        <span className="pointer-events-none absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg" style={{ left: `clamp(24px, ${split}%, calc(100% - 24px))` }}><ChevronsLeftRight size={24} aria-hidden /></span>
        <input type="range" min="0" max="100" value={split} onChange={(event) => setSplit(Number(event.target.value))} aria-label="니트 비포 애프터 비교 막대" aria-valuetext={`비포 ${split}%, 애프터 ${100 - split}%`} className="absolute inset-0 m-0 h-full w-full cursor-ew-resize opacity-0" />
      </div>
      <figcaption className="mt-3 text-center text-xs leading-6 text-muted">막대를 좌우로 움직여 변화를 확인해 보세요.<br /><span className="text-[11px]">같은 크기와 위치로 맞춘 흰 배경의 평면 연출입니다. 비포는 AI 재구성, 애프터는 실제 작품 사진을 바탕으로 AI 연출했어요.</span></figcaption>
    </figure>
  );
}
