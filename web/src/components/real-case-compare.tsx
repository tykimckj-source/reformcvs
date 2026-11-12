"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ChevronsLeftRight } from "lucide-react";

/** Front uses the existing photos; back pairs the shared before with a flattened after. */
export function RealCaseCompare({ side = "front" }: { side?: "front" | "back" }) {
  const isBack = side === "back";
  const label = isBack ? "뒷면" : "앞면";
  const [split, setSplit] = useState(50);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = frame.current?.getBoundingClientRect();
    if (bounds) setSplit(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100)));
  };

  return (
    <figure aria-label={`파란 폴로셔츠 ${label} 리폼 전후 비교`}>
      <div ref={frame} className="relative isolate aspect-square overflow-hidden rounded-[22px] bg-white select-none">
        {/* The selected full after photo uses the same display size as the before crop.
            No separate shortening; both sleeves remain visible. */}
        <svg role="img" aria-label={`리폼 후 ${label}${isBack ? ": 하트 무늬와 고무줄 밑단, 평면화 이미지" : ""}`} viewBox="-24 -24 688 688" className="absolute inset-0 h-full w-full">
          <image href={isBack ? "/cases/blue-polo-back-frontmatch-v2.png" : "/cases/blue-polo-rivets-hd-unified.png"} width="640" height="640" />
        </svg>
        <div className="absolute inset-0 bg-white" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
          {/* Full source photograph including both sleeves, with breathing room. */}
          <svg role="img" aria-label={`리폼 전 ${label}${isBack ? " AI 재현" : ": 흰색 가슴 글씨가 있는 원래 파란 폴로셔츠"}`} viewBox="-24 -24 688 688" className="h-full w-full">
            {isBack ? <image href="/cases/blue-polo-common/before-back-relaxed-unified.png" width="640" height="640" /> : <svg x="0" y="0" width="640" height="640" viewBox="0 0 640 640" overflow="hidden">
              <image href="/cases/blue-polo-pair.png" width="1280" height="640" />
            </svg>}
          </svg>
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white">리폼 전</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white">리폼 후</span>
        <div
          role="slider" tabIndex={0} aria-label={`파란 PK티 ${label} 리폼 전후 비교 막대`} aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={Math.round(split)} aria-valuetext={`리폼 전 ${Math.round(split)}%, 리폼 후 ${100 - Math.round(split)}%`}
          onPointerDown={(event) => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); move(event); }}
          onPointerMove={(event) => { if (dragging.current) move(event); }}
          onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}
          onLostPointerCapture={() => { dragging.current = false; }}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            setSplit((value) => event.key === "Home" ? 0 : event.key === "End" ? 100 : Math.max(0, Math.min(100, value + (event.key === "ArrowLeft" ? -5 : 5))));
          }}
          className="group absolute inset-0 cursor-ew-resize outline-none"
          style={{ touchAction: "pan-y" }}
        >
          <span className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_#0002]" style={{ left: `${split}%` }} />
          <span className="absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg group-focus-visible:ring-4 group-focus-visible:ring-accent" style={{ left: `clamp(22px, ${split}%, calc(100% - 22px))` }}>
            <ChevronsLeftRight size={22} aria-hidden />
          </span>
        </div>
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink">{isBack ? "뒷면 · 평면 비교" : "실제 리폼 사례"}</span>
      </div>
      <figcaption className="mt-3 text-center text-[12.5px] leading-relaxed text-muted">
        막대를 좌우로 움직여 {label} 리폼 전후를 비교해 보세요.
        <span className="mt-1 block text-[11.5px]">{isBack ? "비포는 AI 재현 이미지, 애프터는 실제 사진을 평면화한 이미지입니다." : "디자인 비교를 위해 옷의 크기와 길이를 맞췄어요."}</span>
      </figcaption>
      <div className="mt-2 flex justify-center gap-4 text-xs font-semibold">
        <button type="button" onClick={() => setSplit(100)} className="min-h-10 underline underline-offset-4">비포 전체 보기</button>
        <button type="button" onClick={() => setSplit(0)} className="min-h-10 underline underline-offset-4">애프터 전체 보기</button>
      </div>
      <a href={isBack ? "/cases/blue-polo-back-frontmatch-v2.png" : "/cases/blue-polo-rivets-hd-unified.png"} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-11 items-center justify-center rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-accent focus-visible:outline-2 focus-visible:outline-accent">
        {isBack ? "뒷면 평면화 이미지 크게 보기 ↗" : "리폼 후 원본 크게 보기 · 목깃과 소매 리벳 ↗"}
      </a>
    </figure>
  );
}
