"use client";

import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

export function GrayCaseCompare({ side }: { side: "front" | "back" }) {
  const [split, setSplit] = useState(50);
  const label = side === "front" ? "앞면" : "뒷면";
  return (
    <figure>
      <div className="relative isolate aspect-square overflow-hidden rounded-[22px] bg-white focus-within:ring-2 focus-within:ring-accent">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={side === "back" ? "/cases/gray-recut/after-back-junction.png" : "/cases/gray-recut/after-front.png"} alt={`회색 티 리폼 후 ${label} · 사진 기반 AI 정리`} className="absolute inset-0 h-full w-full origin-top object-contain" style={{ transform: side === "front" ? "translateY(2%) scaleY(0.97)" : "translateY(0.5%) scaleY(0.99)" }} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={side === "front" ? "/cases/gray-recut/before-front-plain.png" : "/cases/gray-recut/before-back.png"} alt={`회색 티 리폼 전 ${label} · 사진 기반 AI 정리`} className="h-full w-full object-contain" />
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-3 py-2 text-[11px] font-semibold text-white">비포 · {label}</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#53634b] px-3 py-2 text-[11px] font-semibold text-white">애프터 · {label}</span>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-sm" style={{ left: `${split}%` }} />
        <span className="pointer-events-none absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg" style={{ left: `clamp(24px, ${split}%, calc(100% - 24px))` }}><ChevronsLeftRight size={24} aria-hidden /></span>
        <input type="range" min="0" max="100" value={split} onChange={(event) => setSplit(Number(event.target.value))} aria-label={`회색 티 ${label} 비포 애프터 비교 막대`} aria-valuetext={`비포 ${split}%, 애프터 ${100 - split}%`} className="absolute inset-0 m-0 h-full w-full cursor-ew-resize opacity-0" />
      </div>
      <figcaption className="mt-3 text-center text-xs leading-6 text-muted">막대를 좌우로 움직여 {label}의 변화를 확인해 보세요.</figcaption>
    </figure>
  );
}
