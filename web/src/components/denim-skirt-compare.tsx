"use client";

import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

export function DenimSkirtCompare({ side }: { side: "front" | "back" }) {
  const [split, setSplit] = useState(50);
  const label = side === "front" ? "앞면" : "뒷면";
  const before = `/cases/denim-skirt/before-${side}.png`;
  // Align waistband landmarks; let the fringe extend below the trouser hem.
  const beforeStyle = { width: "66.6%", height: "90%", left: "16.7%", top: "3%" };
  const afterStyle = { width: "66.6%", height: side === "front" ? "97.6%" : "99.6%", left: "16.7%", top: side === "front" ? "2.9%" : "-1.4%" };
  return <figure>
    <div className="relative isolate aspect-square overflow-hidden rounded-[22px] bg-white focus-within:ring-2 focus-within:ring-accent">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/cases/denim-skirt/after-${side}.png`} alt={`바지 두 벌로 만든 청치마 ${label}`} className="absolute object-fill" style={afterStyle} />
      {before && <>
        <div className="absolute inset-0 bg-white" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={before} alt={`리폼 전 바지 ${label}`} className="absolute object-fill" style={beforeStyle} />
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-3 py-2 text-[11px] font-semibold text-white">비포 · {label}</span>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${split}%` }} />
        <span className="pointer-events-none absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg" style={{ left: `clamp(24px, ${split}%, calc(100% - 24px))` }}><ChevronsLeftRight size={24} aria-hidden /></span>
        <input type="range" min="0" max="100" value={split} onChange={e => setSplit(Number(e.target.value))} aria-label={`청치마 ${label} 비포 애프터 비교 막대`} aria-valuetext={`비포 ${split}%, 애프터 ${100 - split}%`} className="absolute inset-0 m-0 h-full w-full cursor-ew-resize opacity-0" />
      </>}
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#53634b] px-3 py-2 text-[11px] font-semibold text-white">애프터 · {label}</span>
    </div>
    <figcaption className="mt-3 text-center text-xs leading-6 text-muted">막대를 움직여 {label}의 변화를 확인하세요.</figcaption>
    <div className="mt-2 flex justify-center gap-4 text-xs font-semibold">
      <button type="button" onClick={() => setSplit(100)} className="min-h-10 underline underline-offset-4">비포 전체 보기</button>
      <button type="button" onClick={() => setSplit(0)} className="min-h-10 underline underline-offset-4">애프터 전체 보기</button>
    </div>
  </figure>;
}
