"use client";

import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

// Identical presentation on both layers keeps the garment aligned without editing the originals.
const photoStyle = { transform: "scale(0.96)" };

export function TransferSweatshirtCompare({ side }: { side: "front" }) {
  const [split, setSplit] = useState(50);
  const label = side === "front" ? "앞면" : "뒷면";
  return <figure>
    <div className="relative isolate aspect-square overflow-hidden rounded-[22px] bg-white focus-within:ring-2 focus-within:ring-accent">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/cases/transfer-sweatshirt/after-${side}.png`} alt={`전사지 맨투맨 리폼 후 ${label}`} className="absolute inset-0 h-full w-full object-contain" style={photoStyle} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/cases/transfer-sweatshirt/before-${side}.png`} alt={`전사지 맨투맨 리폼 전 ${label}`} className="h-full w-full object-contain" style={photoStyle} />
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-3 py-2 text-[11px] font-semibold text-white">비포 재현 · {label}</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#53634b] px-3 py-2 text-[11px] font-semibold text-white">애프터 정리 · {label}</span>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-sm" style={{ left: `${split}%` }} />
      <span className="pointer-events-none absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg" style={{ left: `clamp(24px, ${split}%, calc(100% - 24px))` }}><ChevronsLeftRight size={24} aria-hidden /></span>
      <input type="range" min="0" max="100" value={split} onChange={event => setSplit(Number(event.target.value))} aria-label={`전사지 맨투맨 ${label} 비포 애프터 비교 막대`} aria-valuetext={`비포 ${split}%, 애프터 ${100 - split}%`} className="absolute inset-0 m-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
    <figcaption className="mt-3 text-center text-xs leading-6 text-muted">막대를 좌우로 움직여 {label}의 변화를 확인해 보세요.</figcaption>
    <div className="mt-2 flex justify-center gap-4 text-xs font-semibold">
      <button type="button" onClick={() => setSplit(100)} className="min-h-10 underline underline-offset-4">비포 전체 보기</button>
      <button type="button" onClick={() => setSplit(0)} className="min-h-10 underline underline-offset-4">애프터 전체 보기</button>
    </div>
  </figure>;
}
