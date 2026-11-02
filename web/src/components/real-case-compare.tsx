"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ChevronsLeftRight } from "lucide-react";

/** Display crops only: the supplied photographs, colors and garment details remain untouched. */
export function RealCaseCompare() {
  const [split, setSplit] = useState(50);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = frame.current?.getBoundingClientRect();
    if (bounds) setSplit(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100)));
  };

  return (
    <figure aria-label="파란 폴로셔츠의 실제 리폼 전후 사진">
      <div ref={frame} className="relative isolate aspect-square overflow-hidden rounded-[22px] bg-white select-none">
        {/* The selected full after photo uses the same display size as the before crop.
            No separate shortening; both sleeves remain visible. */}
        <svg role="img" aria-label="리폼 후: 양쪽 소매와 고무줄 밑단이 보이는 리폼 옷" viewBox="-24 -24 688 688" className="absolute inset-0 h-full w-full">
          <image href="/cases/blue-polo-rivets-hd.png" width="640" height="640" />
        </svg>
        <div className="absolute inset-0 bg-white" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
          {/* Full source photograph including both sleeves, with breathing room. */}
          <svg role="img" aria-label="리폼 전: 흰색 가슴 글씨가 있는 원래 파란 폴로셔츠" viewBox="-24 -24 688 688" className="h-full w-full">
            <svg x="0" y="0" width="640" height="640" viewBox="0 0 640 640" overflow="hidden">
              <image href="/cases/blue-polo-pair.png" width="1280" height="640" />
            </svg>
          </svg>
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white">리폼 전</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white">리폼 후</span>
        <div
          role="slider" tabIndex={0} aria-label="실제 리폼 전후 비교" aria-valuemin={0} aria-valuemax={100}
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
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink">실제 리폼 사례</span>
      </div>
      <figcaption className="mt-3 text-center text-[12.5px] leading-relaxed text-muted">
        막대를 좌우로 움직여 실제 리폼 전후를 비교해 보세요.
        <span className="mt-1 block text-[11.5px]">디자인 비교를 위해 옷의 크기와 길이를 맞췄어요.</span>
      </figcaption>
      <a href="/cases/blue-polo-rivets-hd.png" target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-11 items-center justify-center rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-accent focus-visible:outline-2 focus-visible:outline-accent">
        리폼 후 원본 크게 보기 · 목깃과 소매 리벳 ↗
      </a>
    </figure>
  );
}
