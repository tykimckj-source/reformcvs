"use client";

import { Bell, ClipboardList, ExternalLink, LayoutGrid, Palette, Settings, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/app-frame";
import { MockupStage } from "@/components/mockup-stage";
import { Badge, Button, DemoTag, Toast } from "@/components/ui";
import { SEED_ORDERS } from "@/lib/demo-orders";
import { colorOf, designBySlug, type Design } from "@/lib/designs";
import { garmentFromSample } from "@/lib/factory";
import { cx, won, nowMs } from "@/lib/format";
import { CATEGORY_LABEL, MATERIAL_LABEL, PLACEMENT_LABEL } from "@/lib/garments";
import { maskName, nextStatus, STATUS_LABEL } from "@/lib/orders";
import { dispatch, useIsClient, useStore, type State } from "@/lib/store";
import type { Garment, MockupOptions, OrderStatus } from "@/lib/types";

interface BoardItem {
  key: string;
  orderNo: string;
  customer: string;
  garment: Garment;
  design: Design;
  options: MockupOptions;
  status: OrderStatus;
  age: string;
  due: string;
  total: number;
  live: boolean;
  orderId?: string;
  adjustNote?: string;
}

const COLUMNS: { key: string; title: string; statuses: OrderStatus[] }[] = [
  { key: "ship", title: "발송 대기", statuses: ["AWAITING_SHIPMENT"] },
  { key: "inbound", title: "입고 중", statuses: ["INBOUND_TRANSIT"] },
  { key: "inspect", title: "검수", statuses: ["INSPECTING"] },
  { key: "approval", title: "고객 승인 대기", statuses: ["AWAITING_APPROVAL"] },
  { key: "work", title: "작업", statuses: ["IN_PROGRESS"] },
  { key: "out", title: "출고·완료", statuses: ["OUTBOUND_TRANSIT", "DELIVERED"] },
];

const ACTION: Partial<Record<OrderStatus, string>> = {
  INBOUND_TRANSIT: "입고 처리",
  INSPECTING: "검수 완료 · 확정 시안 보내기",
  IN_PROGRESS: "작업 완료 · 출고",
  OUTBOUND_TRANSIT: "배송 완료 처리",
};

function liveItems(s: State): BoardItem[] {
  return Object.values(s.orders)
    .sort((a, b) => b.createdAt - a.createdAt)
    .flatMap((o) => {
      const session = s.sessions[o.sessionId];
      const garment = session ? s.garments[session.garmentId] : undefined;
      const design = session ? designBySlug(session.designSlug) : undefined;
      if (!session || !garment || !design) return [];
      return [
        {
          key: o.id,
          orderNo: o.orderNo,
          customer: maskName(o.customer.name),
          garment,
          design,
          options: session.options,
          status: o.status,
          age: "오늘",
          due: `D-${design.leadDays + 2}`,
          total: o.total,
          live: true,
          orderId: o.id,
          adjustNote: o.adjustNote,
        },
      ];
    });
}

const seedItems = (statuses: Record<string, OrderStatus>): BoardItem[] =>
  SEED_ORDERS.flatMap((o) => {
    const design = designBySlug(o.designSlug);
    if (!design) return [];
    return [
      {
        key: o.key,
        orderNo: o.orderNo,
        customer: o.customer,
        garment: garmentFromSample(o.sampleId, o.key, 0, true),
        design,
        options: o.options,
        status: statuses[o.key] ?? o.status,
        age: o.age,
        due: o.due,
        total: o.total,
        live: false,
      },
    ];
  });

export default function AdminBoard() {
  const isClient = useIsClient();
  const store = useStore();
  const [seedStatus, setSeedStatus] = useState<Record<string, OrderStatus>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const items = [...(isClient ? liveItems(store) : []), ...seedItems(seedStatus)];
  const selected = items.find((i) => i.key === selectedKey) ?? null;
  const active = items.filter((i) => i.status !== "DELIVERED").length;

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const advance = (item: BoardItem, to: OrderStatus) => {
    if (item.live && item.orderId) dispatch({ type: "order/status", id: item.orderId, status: to, at: nowMs() });
    else setSeedStatus((s) => ({ ...s, [item.key]: to }));
    flash(`${item.orderNo} → ${STATUS_LABEL[to]}`);
  };

  return (
    <div className="min-h-dvh bg-[#f3efe8]">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-5">
          <Logo small />
          <span className="rounded-md bg-navy px-2 py-1 text-[12px] font-bold text-white">운영 콘솔</span>
          <DemoTag>시안</DemoTag>
          <nav className="ml-4 hidden items-center gap-1 text-[14px] md:flex">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f1ece4] px-3 py-1.5 font-semibold">
              <LayoutGrid size={16} /> 주문 보드
            </span>
            {[
              { icon: ClipboardList, label: "수동 시안 큐" },
              { icon: Palette, label: "디자인 카드" },
              { icon: Settings, label: "라우팅·예산" },
            ].map((n) => (
              <span key={n.label} title="다음 단계에서 만들어요" className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg px-3 py-1.5 text-muted">
                <n.icon size={16} /> {n.label}
              </span>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {process.env.NODE_ENV === "development" && <Link href="/admin/patches" className="text-sm font-semibold underline">패치 상품 편집</Link>}
            <Bell size={18} className="text-muted" />
            <Link href="/" className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted hover:text-ink">
              고객 화면 <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-16 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-[-0.02em]">주문 보드</h1>
            <p className="mt-1 text-[14px] text-muted">고객 화면에서 주문하면 이 보드의 맨 앞에 바로 나타나요.</p>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-muted">
            <DemoTag>예시 수치</DemoTag>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "오늘 만든 시안", value: "128건" },
            { label: "시안에서 주문까지", value: "6.2%" },
            { label: "첫 시안 평균", value: "23초" },
            { label: "진행 중 주문", value: `${active}건` },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl border border-line bg-white px-4 py-3">
              <div className="text-[12.5px] text-muted">{k.label}</div>
              <div className="mt-0.5 text-[22px] font-extrabold tracking-[-0.01em]">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const list = items.filter((i) => col.statuses.includes(i.status));
            return (
              <section key={col.key} className="w-[250px] shrink-0 rounded-2xl bg-[#ebe5db]/70 p-2.5">
                <h2 className="flex items-center justify-between px-1 pb-2 text-[13.5px] font-bold">
                  {col.title}
                  <span className="rounded-full bg-white px-2 text-[12px] text-muted">{list.length}</span>
                </h2>
                <ul className="space-y-2">
                  {list.map((item) => (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => setSelectedKey(item.key)}
                        className={cx(
                          "flex w-full gap-2.5 rounded-xl border bg-white p-2.5 text-left transition hover:shadow-md",
                          item.live ? "border-accent/60" : "border-line",
                          selectedKey === item.key && "ring-2 ring-ink",
                        )}
                      >
                        <div className="w-12 shrink-0">
                          <MockupStage garment={item.garment} layers={[{ designSlug: item.design.slug, options: item.options }]} rounded="rounded-md" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] text-muted">{item.orderNo}</div>
                          <div className="truncate text-[13.5px] font-semibold">{item.design.name}</div>
                          <div className="truncate text-[12px] text-muted">
                            {item.garment.name} · {item.customer}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge tone={item.due.startsWith("D-") && Number(item.due.slice(2)) <= 2 ? "warn" : "neutral"}>{item.due}</Badge>
                            {item.live ? <Badge tone="accent">새 주문</Badge> : null}
                            {item.status === "DELIVERED" ? <Badge tone="ok">완료</Badge> : null}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                  {list.length === 0 ? <li className="rounded-xl border border-dashed border-[#d3cabb] px-3 py-6 text-center text-[12.5px] text-muted">비어 있어요</li> : null}
                </ul>
              </section>
            );
          })}
        </div>
      </main>

      {selected ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={() => setSelectedKey(null)}>
          <aside
            className="flex h-full w-full max-w-[440px] flex-col overflow-y-auto bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            aria-label="작업지시서"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4">
              <div>
                <div className="text-[12px] text-muted">작업지시서 · {selected.orderNo}</div>
                <div className="text-[17px] font-bold">{selected.design.name}</div>
              </div>
              <button type="button" onClick={() => setSelectedKey(null)} aria-label="닫기" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div className="flex items-center gap-2">
                <Badge tone="navy">{STATUS_LABEL[selected.status]}</Badge>
                {selected.live ? <Badge tone="accent">고객 화면과 연결됨</Badge> : <Badge>예시 주문</Badge>}
              </div>
              <div className="mx-auto w-[62%]">
                <MockupStage garment={selected.garment} layers={[{ designSlug: selected.design.slug, options: selected.options }]} />
              </div>
              <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 rounded-2xl bg-[#f7f4ee] p-4 text-[13.5px]">
                <dt className="text-muted">고객</dt>
                <dd>{selected.customer}</dd>
                <dt className="text-muted">의류</dt>
                <dd>
                  {CATEGORY_LABEL[selected.garment.category]} · {selected.garment.colorName}
                  {selected.garment.material ? ` · ${MATERIAL_LABEL[selected.garment.material]}` : ""}
                </dd>
                <dt className="text-muted">위치</dt>
                <dd>{PLACEMENT_LABEL[selected.options.placement]}</dd>
                <dt className="text-muted">크기</dt>
                <dd>{selected.options.sizeCm.toFixed(1)}cm</dd>
                <dt className="text-muted">색상</dt>
                <dd>
                  {colorOf(selected.design, selected.options.colorId).label}
                  {selected.options.text ? ` · 이니셜 "${selected.options.text}"` : ""}
                </dd>
                <dt className="text-muted">금액</dt>
                <dd>{won(selected.total)}</dd>
                {selected.adjustNote ? (
                  <>
                    <dt className="text-muted">고객 요청</dt>
                    <dd className="font-semibold text-accent">{selected.adjustNote}</dd>
                  </>
                ) : null}
              </dl>
              <div>
                <div className="text-[13.5px] font-bold">작업 순서</div>
                <ol className="mt-2 space-y-1.5 text-[13.5px]">
                  {selected.design.ops.map((op, i) => (
                    <li key={op} className="flex gap-2">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                      {op}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <div className="text-[13.5px] font-bold">입고 검수 실측</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {["가슴 단면 (cm)", "기준점 거리 (cm)"].map((label) => (
                    <label key={label} className="block text-[12px] text-muted">
                      {label}
                      <input inputMode="decimal" placeholder="0.0" className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-[14px] text-ink outline-none focus:border-ink" />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-auto border-t border-line px-5 py-4">
              {ACTION[selected.status] ? (
                <Button className="w-full" size="md" onClick={() => advance(selected, nextStatus(selected.status) ?? selected.status)}>
                  {ACTION[selected.status]}
                </Button>
              ) : selected.status === "AWAITING_SHIPMENT" ? (
                <Button className="w-full" size="md" variant="secondary" onClick={() => flash("고객에게 발송 안내 알림톡을 다시 보냈어요 (시안)")}>
                  발송 안내 다시 보내기
                </Button>
              ) : selected.status === "AWAITING_APPROVAL" ? (
                <div className="space-y-2">
                  <p className="text-center text-[13px] text-muted">고객이 확정 시안에 답하기를 기다리고 있어요</p>
                  {!selected.live ? (
                    <Button className="w-full" size="md" variant="secondary" onClick={() => advance(selected, "IN_PROGRESS")}>
                      승인 받은 것으로 표시
                    </Button>
                  ) : null}
                </div>
              ) : (
                <p className="text-center text-[13px] text-muted">완료된 주문이에요</p>
              )}
              {selected.live && selected.orderId ? (
                <Link href={`/orders/${selected.orderId}`} target="_blank" className="mt-3 flex items-center justify-center gap-1 text-[13px] font-semibold text-muted hover:text-ink">
                  고객이 보는 화면 열기 <ExternalLink size={13} />
                </Link>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
      <Toast message={toast} />
    </div>
  );
}
