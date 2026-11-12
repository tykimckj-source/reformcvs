"use client";

import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

export function BlueZipperCompare({ side }: { side: "front" | "back" }) {
  const [split, setSplit] = useState(side === "front" ? 72 : 50);
  const label = side === "front" ? "앞면" : "뒷면";
  return <figure>
    <div className="relative isolate aspect-square overflow-hidden rounded-[22px] bg-white focus-within:ring-2 focus-within:ring-accent">
      <svg role="img" aria-label={`지퍼 리폼 후 ${label}`} viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full">
        {/* Keep the enlarged back proportions; the tailored hem ends above the before hem. */}
        <image href={side === "back" ? "/cases/blue-zipper/after-back-neat-hem.png" : "/cases/blue-zipper/after-front-color-unified.png"} x={side === "front" ? 117.5 : 71.6} y={side === "front" ? -98.84 : -99.08} width={side === "front" ? 765 : 856.8} height={side === "front" ? 1020 : 1142.4} preserveAspectRatio="xMidYMid meet" />
      </svg>
      <div className="absolute inset-0 bg-white" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
        <svg role="img" aria-label={`리폼 전 ${label}${side === "back" ? " AI 재현" : ""}`} viewBox="0 0 1000 1000" className="h-full w-full">
          {side === "front" ? (
            <svg x="40" y="0" width="920" height="920" viewBox="0 0 640 640" overflow="hidden">
              {/* Use exactly the same before photograph and crop as the home page. */}
              <image href="/cases/blue-polo-pair.png" width="1280" height="640" />
            </svg>
          ) : <image href="/cases/blue-polo-common/before-back-relaxed-unified.png" x="40" y="5" width="920" height="920" preserveAspectRatio="xMidYMid meet" />}
        </svg>
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-3 py-2 text-[11px] font-semibold text-white">비포{side === "back" ? " 재현" : ""} · {label}</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#53634b] px-3 py-2 text-[11px] font-semibold text-white">애프터 · {label}</span>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-sm" style={{ left: `${split}%` }} />
      <span className="pointer-events-none absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg" style={{ left: `clamp(24px, ${split}%, calc(100% - 24px))` }}><ChevronsLeftRight size={24} aria-hidden /></span>
      <input type="range" min="0" max="100" value={split} onChange={event => setSplit(Number(event.target.value))} aria-label={`지퍼 리폼 PK티 ${label} 비포 애프터 비교 막대`} aria-valuetext={`비포 ${split}%, 애프터 ${100 - split}%`} className="absolute inset-0 m-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
    <figcaption className="mt-3 text-center text-xs leading-6 text-muted">막대를 좌우로 움직여 {label}의 변화를 확인해 보세요.{side === "front" && <span className="block">비포 전체 보기에서 ‘대한민국 사회적가치 페스타’ 가슴 로고를 확인할 수 있어요.</span>}</figcaption>
    <div className="mt-2 flex justify-center gap-4 text-xs font-semibold">
      <button type="button" onClick={() => setSplit(100)} className="min-h-10 underline underline-offset-4">비포 전체 보기</button>
      <button type="button" onClick={() => setSplit(0)} className="min-h-10 underline underline-offset-4">애프터 전체 보기</button>
    </div>
  </figure>;
}
