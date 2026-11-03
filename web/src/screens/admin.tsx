"use client";

import { Bell, ClipboardList, Download, ExternalLink, LayoutGrid, LogOut, Palette, Settings, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Logo } from "@/components/app-frame";
import { MockupStage } from "@/components/mockup-stage";
import { Badge, Button, DemoTag, TextField, Toast } from "@/components/ui";
import { adminSignIn, adminSignOut, backendOn, isAdmin, pullAll, sendConfirm, updateOrder, watchAll } from "@/lib/db";
import { SEED_ORDERS } from "@/lib/demo-orders";
import { colorOf, designBySlug, type Design } from "@/lib/designs";
import { garmentFromSample } from "@/lib/factory";
import { csv, cx, won, nowMs } from "@/lib/format";
import { CATEGORY_LABEL, MATERIAL_LABEL, PLACEMENT_LABEL } from "@/lib/garments";
import { preparePhoto } from "@/lib/image";
import { CARRIERS, maskName, nextStatus, STATUS_LABEL } from "@/lib/orders";
import { downloadDataUrl } from "@/lib/render";
import { dispatch, useIsClient, useStore, type State } from "@/lib/store";
import type { Garment, MockupOptions, Order, OrderStatus } from "@/lib/types";

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
  order?: Order;
}

const EMPTY_FORM = { photo: null as File | null, note: "", carrier: "CJ대한통운", number: "" };

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
          order: o,
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

const kst = (ts: number) => new Date(ts).toLocaleString("sv-SE", { timeZone: "Asia/Seoul" });

/** 보드의 주문을 엑셀용 표로. 정산·결과보고·택배 접수에 쓴다 */
const boardCsv = (items: BoardItem[]) =>
  csv([
    ["주문번호", "주문일시", "상태", "디자인", "의류", "위치", "크기(cm)", "색상", "이니셜", "금액(원)", "이름", "연락처", "주소", "받은 택배", "보낸 택배", "고객 요청", "별점"],
    ...items.map((i) => [
      i.orderNo,
      i.order ? kst(i.order.createdAt).slice(0, 16) : "",
      STATUS_LABEL[i.status],
      i.design.name,
      `${CATEGORY_LABEL[i.garment.category]} · ${i.garment.colorName}`,
      PLACEMENT_LABEL[i.options.placement],
      i.options.sizeCm,
      colorOf(i.design, i.options.colorId).label,
      i.options.text,
      i.total,
      i.order?.customer.name ?? i.customer,
      i.order?.customer.phone,
      i.order?.customer.address,
      i.order?.tracking && `${i.order.tracking.carrier} ${i.order.tracking.number}`,
      i.order?.outbound && `${i.order.outbound.carrier} ${i.order.outbound.number}`,
      i.adjustNote,
      i.order?.rating,
    ]),
  ]);

function AdminLogin({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminSignIn(email.trim(), password);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인하지 못했어요");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-[#f3efe8] px-5">
      <form onSubmit={submit} className="w-full max-w-[360px] space-y-3 rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center gap-3 pb-2">
          <Logo small />
          <span className="rounded-md bg-navy px-2 py-1 text-[12px] font-bold text-white">운영 콘솔</span>
        </div>
        <TextField label="이메일" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="text-[13px] font-semibold text-[#c2412d]">{error}</p> : null}
        <Button type="submit" className="w-full" size="md" disabled={busy}>
          로그인
        </Button>
      </form>
    </div>
  );
}

export default function AdminBoard() {
  const isClient = useIsClient();
  const store = useStore();
  const [seedStatus, setSeedStatus] = useState<Record<string, OrderStatus>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // 서버 모드: admin이 null이면 로그인 확인 중, server는 모든 손님의 주문
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [server, setServer] = useState<State | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => pullAll().then(setServer).catch(() => setToast("주문을 불러오지 못했어요")), []);

  useEffect(() => {
    if (backendOn) void isAdmin().then(setAdmin);
  }, []);

  useEffect(() => {
    if (!admin) return;
    void reload();
    return watchAll(() => void reload());
  }, [admin, reload]);

  if (backendOn && admin === false) return <AdminLogin onDone={() => setAdmin(true)} />;

  const items = backendOn
    ? server
      ? liveItems(server)
      : []
    : [...(isClient ? liveItems(store) : []), ...seedItems(seedStatus)];
  const selected = items.find((i) => i.key === selectedKey) ?? null;
  const active = items.filter((i) => i.status !== "DELIVERED").length;

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const select = (key: string | null) => {
    setSelectedKey(key);
    setForm(EMPTY_FORM);
  };

  const download = () =>
    downloadDataUrl(
      URL.createObjectURL(new Blob([boardCsv(items)], { type: "text/csv;charset=utf-8" })),
      `리폼편의점_주문_${kst(nowMs()).slice(0, 10)}.csv`,
    );

  const advance = async (item: BoardItem, to: OrderStatus, patch: Record<string, unknown> = {}) => {
    if (backendOn && item.orderId) {
      setBusy(true);
      try {
        await updateOrder(item.orderId, { status: to, ...patch });
        await reload();
      } catch (e) {
        return flash(e instanceof Error ? e.message : "상태를 바꾸지 못했어요");
      } finally {
        setBusy(false);
      }
    } else if (item.live && item.orderId) dispatch({ type: "order/status", id: item.orderId, status: to, at: nowMs() });
    else setSeedStatus((s) => ({ ...s, [item.key]: to }));
    flash(`${item.orderNo} → ${STATUS_LABEL[to]}`);
  };

  /** 입고 검수를 마치고 실물 사진(선택)과 메모로 손님 승인을 요청한다 */
  const confirm = async (item: BoardItem) => {
    if (!item.order) return;
    setBusy(true);
    try {
      const photo = form.photo ? await (await fetch((await preparePhoto(form.photo)).dataUrl)).blob() : null;
      await sendConfirm(item.order, photo, form.note);
      await reload();
      setForm(EMPTY_FORM);
      flash(`${item.orderNo} → ${STATUS_LABEL.AWAITING_APPROVAL}`);
    } catch (e) {
      flash(e instanceof Error ? e.message : "확정 시안을 보내지 못했어요");
    } finally {
      setBusy(false);
    }
  };

  const kpis = backendOn
    ? [
        { label: "진행 중 주문", value: `${active}건` },
        { label: "전체 주문", value: `${items.length}건` },
      ]
    : [
        { label: "오늘 만든 시안", value: "128건" },
        { label: "시안에서 주문까지", value: "6.2%" },
        { label: "첫 시안 평균", value: "23초" },
        { label: "진행 중 주문", value: `${active}건` },
      ];

  return (
    <div className="min-h-dvh bg-[#f3efe8]">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-5">
          <Logo small />
          <span className="rounded-md bg-navy px-2 py-1 text-[12px] font-bold text-white">운영 콘솔</span>
          {backendOn ? null : <DemoTag>시안</DemoTag>}
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
            <Bell size={18} className="text-muted" />
            <Link href="/" className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted hover:text-ink">
              고객 화면 <ExternalLink size={13} />
            </Link>
            {backendOn && admin ? (
              <button
                type="button"
                onClick={async () => {
                  await adminSignOut();
                  setServer(null);
                  setAdmin(false);
                }}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted hover:text-ink"
              >
                <LogOut size={14} /> 로그아웃
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 pb-16 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-[-0.02em]">주문 보드</h1>
            <p className="mt-1 text-[14px] text-muted">고객 화면에서 주문하면 이 보드의 맨 앞에 바로 나타나요.</p>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted">
            {backendOn ? null : <DemoTag>예시 수치</DemoTag>}
            <Button variant="secondary" size="sm" disabled={items.length === 0} onClick={download}>
              <Download size={15} /> 엑셀로 내려받기
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpis.map((k) => (
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
                        onClick={() => select(item.key)}
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
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={() => select(null)}>
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
              <button type="button" onClick={() => select(null)} aria-label="닫기" className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5">
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
              {selected.order?.confirmPhoto ? (
                <figure className="mx-auto w-[62%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.order.confirmPhoto} alt="보낸 확정 사진" className="w-full rounded-xl" />
                  <figcaption className="mt-1 text-center text-[12px] text-muted">손님에게 보낸 실물 사진</figcaption>
                </figure>
              ) : null}
              <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 rounded-2xl bg-[#f7f4ee] p-4 text-[13.5px]">
                <dt className="text-muted">고객</dt>
                <dd>{selected.order?.customer.name ?? selected.customer}</dd>
                {selected.order ? (
                  <>
                    <dt className="text-muted">연락처</dt>
                    <dd>{selected.order.customer.phone}</dd>
                    <dt className="text-muted">주소</dt>
                    <dd>{selected.order.customer.address}</dd>
                  </>
                ) : null}
                {selected.order?.tracking ? (
                  <>
                    <dt className="text-muted">받는 택배</dt>
                    <dd>
                      {selected.order.tracking.carrier} · {selected.order.tracking.number}
                    </dd>
                  </>
                ) : null}
                {selected.order?.outbound ? (
                  <>
                    <dt className="text-muted">보낸 택배</dt>
                    <dd>
                      {selected.order.outbound.carrier} · {selected.order.outbound.number}
                    </dd>
                  </>
                ) : null}
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
              {backendOn && selected.status === "INSPECTING" ? (
                <div className="space-y-2">
                  <label className="block text-[12.5px] font-semibold">
                    실물 사진 (선택)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] ?? null })}
                      className="mt-1 block w-full text-[13px] font-normal"
                    />
                  </label>
                  <textarea
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="손님에게 전할 말 (예: 왼쪽 가슴 6cm로 맞췄어요)"
                    className="h-20 w-full resize-none rounded-xl border border-line p-3 text-[13.5px] outline-none focus:border-ink"
                  />
                  <Button className="w-full" size="md" disabled={busy} onClick={() => confirm(selected)}>
                    검수 완료 · 확정 시안 보내기
                  </Button>
                </div>
              ) : backendOn && selected.status === "IN_PROGRESS" ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1.3fr] gap-2">
                    <select
                      value={form.carrier}
                      onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                      aria-label="돌려보낼 택배사"
                      className="h-11 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-[13.5px] outline-none focus:border-ink"
                    >
                      {CARRIERS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      value={form.number}
                      onChange={(e) => setForm({ ...form, number: e.target.value.replace(/[^0-9 -]/g, "") })}
                      inputMode="numeric"
                      placeholder="출고 송장 번호"
                      aria-label="출고 송장 번호"
                      className="h-11 w-full min-w-0 rounded-xl border border-line px-3 text-[13.5px] outline-none focus:border-ink"
                    />
                  </div>
                  <Button
                    className="w-full"
                    size="md"
                    disabled={busy || form.number.replace(/\D/g, "").length < 8}
                    onClick={() => advance(selected, "OUTBOUND_TRANSIT", { outbound: { carrier: form.carrier, number: form.number.trim() } })}
                  >
                    작업 완료 · 출고
                  </Button>
                </div>
              ) : ACTION[selected.status] ? (
                <Button className="w-full" size="md" disabled={busy} onClick={() => advance(selected, nextStatus(selected.status) ?? selected.status)}>
                  {ACTION[selected.status]}
                </Button>
              ) : selected.status === "AWAITING_SHIPMENT" ? (
                backendOn ? (
                  <p className="text-center text-[13px] text-muted">손님이 택배를 보내고 송장을 넣으면 ‘입고 중’으로 넘어와요</p>
                ) : (
                  <Button className="w-full" size="md" variant="secondary" onClick={() => flash("고객에게 발송 안내 알림톡을 다시 보냈어요 (시안)")}>
                    발송 안내 다시 보내기
                  </Button>
                )
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
