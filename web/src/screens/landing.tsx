"use client";

import { Camera, ChevronRight, Package, Scissors, Shirt, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo, PhoneFrame } from "@/components/app-frame";
import { DesignSwatch, MockupStage } from "@/components/mockup-stage";
import { LinkButton, Toast } from "@/components/ui";
import { backendOn, forgetMe } from "@/lib/db";
import { DESIGNS } from "@/lib/designs";
import { garmentFromSample } from "@/lib/factory";
import { won } from "@/lib/format";
import { SAMPLE_GARMENTS } from "@/lib/garments";
import { STATUS_LABEL } from "@/lib/orders";
import { dispatch, useStore } from "@/lib/store";

const hero = garmentFromSample("denim-jacket", "hero", 0, true);
const heroLayers = [
  {
    designSlug: "daisy-embroidery",
    options: { placement: "left-chest" as const, pos: hero.anchors["left-chest"]!, sizeCm: 8.5, colorId: "white", text: "" },
  },
  {
    designSlug: "smile-wappen",
    options: { placement: "sleeve" as const, pos: hero.anchors.sleeve!, sizeCm: 8.5, colorId: "yellow", text: "" },
  },
  {
    designSlug: "star-patch",
    options: { placement: "hem" as const, pos: hero.anchors.hem!, sizeCm: 9, colorId: "red", text: "" },
  },
];

const STEPS = [
  { icon: Camera, title: "옷 사진 한 장", desc: "바닥에 펼쳐 찍기만 하면 돼요" },
  { icon: Sparkles, title: "AI가 옷을 알아보고 추천", desc: "종류·색·소재에 맞는 디자인만 보여 드려요" },
  { icon: Shirt, title: "내 옷 위에 시안 보기", desc: "위치·크기·색을 바꿔 가며 바로 확인해요" },
  { icon: Store, title: "결제하고 편의점에서 보내기", desc: "실물 검수 후 확정 시안을 한 번 더 승인해요" },
  { icon: Package, title: "리폼해서 돌려드려요", desc: "작업 기간은 디자인에 따라 5–7일이에요" },
];

const FABRICS = ["#3e5f8a", "#f1efe9", "#a8aaad", "#2a2b30", "#d6c2a0", "#6e6c46"];

export default function Landing() {
  const [toast, setToast] = useState<string | null>(null);
  const { orders, manual } = useStore();
  const mine = Object.values(orders).sort((a, b) => b.createdAt - a.createdAt)[0];
  const designerReady = Object.values(manual)
    .filter((m) => m.doneAt)
    .sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))[0];

  const resetDemo = async () => {
    const flash = (message: string) => {
      setToast(message);
      window.setTimeout(() => setToast(null), 3000);
    };
    const hadOrders = Object.keys(orders).length > 0;
    try {
      if (backendOn) await forgetMe();
    } catch (e) {
      return flash(e instanceof Error ? e.message : "기록을 지우지 못했어요");
    }
    dispatch({ type: "reset" });
    flash(backendOn && hadOrders ? "체험 기록을 지웠어요. 주문은 법에 따라 보관되고, 주문번호와 연락처로 다시 찾을 수 있어요" : "체험 기록을 모두 지웠어요");
  };

  return (
    <PhoneFrame>
      <header className="flex items-center justify-between px-5 pt-5">
        <Logo />
        <Link href="/admin" className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-muted hover:text-ink">
          운영 콘솔 보기
        </Link>
      </header>

      <section className="px-5 pt-7">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-[13px] font-semibold text-accent">
          <Sparkles size={14} /> AI 리폼 미리보기
        </span>
        <h1 className="mt-4 text-[34px] font-extrabold leading-[1.2] tracking-[-0.025em]">
          입던 옷에
          <br />
          리폼을 먼저
          <br />
          입혀 보세요
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
          사진 한 장이면 자수·와펜·패치를 올린 내 옷을 바로 볼 수 있어요. 마음에 들면 편의점 택배로 보내기만 하세요.
        </p>
      </section>

      <section className="px-5 pt-6">
        <MockupStage garment={hero} layers={heroLayers} compare badge />
        <p className="mt-2.5 text-center text-[12.5px] text-muted">가운데 손잡이를 좌우로 끌어 원본과 비교해 보세요</p>
      </section>

      <section className="grid gap-2.5 px-5 pt-6">
        <LinkButton href="/capture">
          <Camera size={19} /> 내 옷 찍어 보기
        </LinkButton>
        <LinkButton href="/capture#samples" variant="secondary">
          샘플 옷으로 체험하기
        </LinkButton>
        {mine ? (
          <Link
            href={`/orders/${mine.id}`}
            className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-[14px]"
          >
            <span>
              <b>내 주문</b> <span className="text-muted">{mine.orderNo}</span>
            </span>
            <span className="flex items-center gap-0.5 font-semibold">
              {STATUS_LABEL[mine.status]} <ChevronRight size={16} />
            </span>
          </Link>
        ) : null}
        {designerReady ? (
          <Link
            href={`/m/${designerReady.sessionId}`}
            className="flex items-center justify-between rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3 text-[14px] font-semibold text-accent"
          >
            디자이너 시안이 도착했어요 <ChevronRight size={16} />
          </Link>
        ) : null}
        <Link href="/orders/find" className="pt-1 text-center text-[13.5px] font-semibold text-muted underline underline-offset-4 hover:text-ink">
          다른 기기에서 주문하셨나요? 주문번호로 찾기
        </Link>
      </section>

      <section className="px-5 pt-12">
        <h2 className="text-[20px] font-bold tracking-[-0.01em]">이렇게 진행돼요</h2>
        <ol className="mt-4 space-y-0">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-3.5 pb-5 last:pb-0">
              {i < STEPS.length - 1 ? <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] border-l border-dashed border-[#cfc6b8]" /> : null}
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink ring-1 ring-line">
                <s.icon size={18} />
              </span>
              <div className="pt-1">
                <div className="text-[15.5px] font-semibold">{s.title}</div>
                <div className="mt-0.5 text-[13.5px] text-muted">{s.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pt-12">
        <div className="flex items-end justify-between px-5">
          <h2 className="text-[20px] font-bold tracking-[-0.01em]">지금 고를 수 있는 디자인</h2>
          <span className="text-[12.5px] text-muted">가격은 예시</span>
        </div>
        <div className="no-scrollbar mt-4 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
          {DESIGNS.map((d, i) => (
            <div key={d.slug} className="w-[148px] shrink-0 snap-start">
              <DesignSwatch design={d} colorId={d.colors[i % 2 === 0 ? 1 : 0].id} fabric={FABRICS[i % FABRICS.length]} className="aspect-square rounded-2xl" />
              <div className="mt-2 text-[12px] font-semibold text-accent">{d.typeLabel}</div>
              <div className="text-[14.5px] font-semibold">{d.name}</div>
              <div className="text-[13px] text-muted">{won(d.basePrice)}부터</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-10">
        <div className="rounded-[20px] border border-dashed border-[#cfc6b8] bg-[#fbf9f5] p-4">
          <div className="flex items-center gap-2 text-[14.5px] font-semibold">
            <Scissors size={16} className="text-accent" /> 시안은 AI 예시 이미지예요
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
            실제 원단과 조명에 따라 결과가 조금 다를 수 있어요. 옷이 도착하면 실물을 검수하고, 실물 위 확정 시안을 한 번 더 보여 드린 뒤 작업을 시작해요.
          </p>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_GARMENTS.map((g) => (
            <Link key={g.sampleId} href="/capture#samples" className="group overflow-hidden rounded-2xl bg-white ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.image} alt={g.name} className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.03]" />
              <div className="flex items-center justify-between px-2.5 py-2 text-[12.5px] font-semibold">
                {g.name}
                <ChevronRight size={14} className="text-muted" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-auto px-5 pb-10 pt-12 text-[12px] leading-relaxed text-muted">
        <p>
          {backendOn
            ? "AI 생성, 결제, 배송 조회는 아직 연결하지 않았어요. ‘체험 기록 지우기’를 누르면 이 브라우저의 기록과 함께, 주문에 쓰이지 않은 옷 사진과 시안을 서버에서도 지워요."
            : "이 화면은 프론트엔드 시안입니다. AI 생성, 결제, 배송 조회는 아직 연결하지 않았고, 체험 기록은 이 브라우저에만 저장돼요."}
        </p>
        <button type="button" onClick={resetDemo} className="mt-3 font-semibold text-ink underline underline-offset-4">
          체험 기록 지우기
        </button>
      </footer>
      <Toast message={toast} />
    </PhoneFrame>
  );
}
