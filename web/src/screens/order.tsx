"use client";

import { Check, CircleCheck, Copy, PackageCheck, Scissors, Star, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Missing, PhoneFrame, ScreenSkeleton, TopBar } from "@/components/app-frame";
import { MockupStage } from "@/components/mockup-stage";
import { Button, Card, DemoTag, Toast } from "@/components/ui";
import { answerConfirm, backendOn, rateOrder, requestCancel, shipOrder } from "@/lib/db";
import { colorOf, designBySlug } from "@/lib/designs";
import { cx, timeLabel, won, nowMs } from "@/lib/format";
import { PLACEMENT_LABEL } from "@/lib/garments";
import { CANCELLABLE, CARRIERS, nextStatus, ORDER_STEPS, stepIndex, WORKSHOP_ADDRESS } from "@/lib/orders";
import { dispatch, useIsClient, useStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import FindOrderScreen from "@/screens/find-order";

export default function OrderScreen() {
  const { orderId } = useParams<{ orderId: string }>();
  const isClient = useIsClient();
  const { orders, sessions, garments } = useStore();
  const [carrier, setCarrier] = useState(CARRIERS[0]);
  const [tracking, setTracking] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const order = orders[orderId];
  const session = order ? sessions[order.sessionId] : undefined;
  const garment = session ? garments[session.garmentId] : undefined;
  const design = session ? designBySlug(session.designSlug) : undefined;

  if (!isClient) return <ScreenSkeleton />;
  // 서버 모드에서는 다른 브라우저에서 한 주문일 수 있으니 주문번호·연락처로 찾게 한다
  if (!order || !session || !garment || !design) return backendOn ? <FindOrderScreen lost /> : <Missing what="주문" />;

  const o = session.options;
  const current = stepIndex(order.status);
  const setStatus = (status: OrderStatus) => dispatch({ type: "order/status", id: order.id, status, at: nowMs() });
  const timeOf = (status: OrderStatus) => order.history.find((h) => h.status === status)?.at;

  /** 서버가 있으면 먼저 서버 규칙을 통과시킨 뒤 화면에 반영한다 */
  const act = async (onServer: () => Promise<void>, apply: () => void, message: string) => {
    try {
      if (backendOn) await onServer();
      apply();
      setToast(message);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "다시 시도해 주세요");
    }
  };

  const registerShipment = (c: string, n: string) =>
    act(
      () => shipOrder(order.id, c, n),
      () => {
        dispatch({ type: "order/update", id: order.id, patch: { tracking: { carrier: c, number: n } } });
        setStatus("INBOUND_TRANSIT");
      },
      "발송을 등록했어요. 작업실에 도착하면 알려 드릴게요.",
    );

  const demoNext = () => {
    if (order.status === "AWAITING_SHIPMENT") return registerShipment("GS25 반값택배", "3612 0045 8821");
    const next = nextStatus(order.status);
    if (next) setStatus(next);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(WORKSHOP_ADDRESS);
      setToast("주소를 복사했어요");
    } catch {
      setToast(WORKSHOP_ADDRESS);
    }
  };

  const stage = <MockupStage garment={garment} layers={[{ designSlug: design.slug, options: o }]} badge />;

  return (
    <PhoneFrame>
      <TopBar title="주문 진행" backHref="/" />

      <section className="px-5 pt-1">
        {order.status === "AWAITING_SHIPMENT" ? (
          <div className="mb-3 flex items-center gap-2.5 rounded-2xl bg-[#e6f5ec] px-4 py-3 text-[14.5px] font-semibold text-[#17734a]">
            <CircleCheck size={20} /> 결제가 끝났어요. 주문이 접수됐어요
          </div>
        ) : null}
        <Card className="flex gap-3.5 p-3">
          <div className="w-[76px] shrink-0">
            <MockupStage garment={garment} layers={[{ designSlug: design.slug, options: o }]} rounded="rounded-xl" />
          </div>
          <div className="min-w-0 flex-1 py-0.5 text-[13px]">
            <div className="text-muted">주문번호 {order.orderNo}</div>
            <div className="mt-0.5 text-[16px] font-bold">{design.name}</div>
            <div className="text-muted">
              {garment.name} · {PLACEMENT_LABEL[o.placement]} · {o.sizeCm.toFixed(1)}cm · {colorOf(design, o.colorId).label}
            </div>
            <div className="mt-1 font-semibold">{won(order.total)} 결제</div>
          </div>
        </Card>
        {backendOn ? (
          <p className="mt-2 px-1 text-[12.5px] text-muted">주문번호와 연락처만 있으면 다른 기기에서도 이 주문을 찾을 수 있어요.</p>
        ) : null}
      </section>

      <section className="px-5 pt-3">
        {order.cancelRequestedAt && order.status !== "CANCELLED" ? (
          <div className="mb-3 rounded-2xl bg-[#fbeee9] px-4 py-3 text-[13.5px] font-semibold text-[#a3341f]">
            취소를 요청했어요. 담당자가 확인하고 반송과 환불을 안내해 드려요.
          </div>
        ) : null}

        {order.status === "CANCELLED" ? (
          <Card>
            <h2 className="text-[17px] font-bold">주문이 취소됐어요</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              작업실에 도착한 옷이 있으면 돌려보내 드리고, 결제하신 금액은 환불해 드려요. 궁금한 점은 담당자에게 문의해 주세요.
            </p>
          </Card>
        ) : null}

        {order.status === "AWAITING_SHIPMENT" ? (
          <Card>
            <h2 className="text-[17px] font-bold">옷을 보내 주세요</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              편의점 택배(반값택배·알뜰택배)로 아래 주소에 보내 주세요. 접어서 비닐에 한 번 넣으면 충분해요.
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#f6f2ec] p-3 text-[13.5px]">
              <span className="flex-1 leading-snug">{WORKSHOP_ADDRESS}</span>
              <button type="button" onClick={copyAddress} className="inline-flex shrink-0 items-center gap-1 font-semibold text-ink">
                <Copy size={14} /> 복사
              </button>
            </div>
            <div className="mt-4 grid grid-cols-[1fr_1.3fr] gap-2">
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                aria-label="택배사"
                className="h-12 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-[14px] outline-none focus:border-ink"
              >
                {CARRIERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value.replace(/[^0-9 -]/g, ""))}
                inputMode="numeric"
                placeholder="송장 번호"
                aria-label="송장 번호"
                className="h-12 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-[14px] outline-none focus:border-ink"
              />
            </div>
            <Button className="mt-3 w-full" size="md" disabled={tracking.replace(/\D/g, "").length < 8} onClick={() => registerShipment(carrier, tracking)}>
              <Truck size={17} /> 발송 등록
            </Button>
            <p className="mt-2 text-[12px] text-muted">7일 안에 등록하지 않으면 알림톡으로 한 번 더 알려 드려요.</p>
          </Card>
        ) : null}

        {order.status === "INBOUND_TRANSIT" ? (
          <Card>
            <h2 className="text-[17px] font-bold">작업실로 가고 있어요</h2>
            <p className="mt-1 text-[13.5px] text-muted">
              {order.tracking?.carrier} · {order.tracking?.number}
            </p>
            <p className="mt-2 text-[13px] text-muted">도착하면 실물을 검수하고 확정 시안을 보내 드려요.</p>
          </Card>
        ) : null}

        {order.status === "INSPECTING" ? (
          <Card>
            <h2 className="text-[17px] font-bold">실물을 검수하고 있어요</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
              원단 상태와 치수를 확인한 뒤, 실물 사진 위에 디자인을 맞춘 확정 시안을 보내 드려요.
              {order.adjustNote ? ` 요청하신 내용: "${order.adjustNote}"` : ""}
            </p>
          </Card>
        ) : null}

        {order.status === "AWAITING_APPROVAL" ? (
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold">확정 시안을 확인해 주세요</h2>
              <span className="text-[12px] font-semibold text-accent">기한 안에 답해 주세요</span>
            </div>
            <p className="mt-1 text-[13.5px] text-muted">작업실에 도착한 실물 위에 디자인을 맞춰 봤어요.</p>
            <div className="mt-3">
              {order.confirmPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={order.confirmPhoto} alt="작업실에 도착한 실물 사진" className="w-full rounded-2xl" />
              ) : (
                stage
              )}
            </div>
            {order.confirmNote ? <p className="mt-2 text-[13.5px] leading-relaxed">{order.confirmNote}</p> : null}
            <ul className="mt-3 space-y-1 rounded-xl bg-[#f6f2ec] p-3 text-[13.5px]">
              <li>위치 · {PLACEMENT_LABEL[o.placement]} (실측 기준)</li>
              <li>크기 · {o.sizeCm.toFixed(1)}cm</li>
              <li>추가 비용 · 없음</li>
            </ul>
            {adjusting ? (
              <div className="mt-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="예: 조금 더 위로 올려 주세요"
                  className="h-24 w-full resize-none rounded-xl border border-line p-3 text-[14px] outline-none focus:border-ink"
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="md" onClick={() => setAdjusting(false)}>
                    취소
                  </Button>
                  <Button
                    size="md"
                    disabled={!note.trim()}
                    onClick={() =>
                      act(
                        () => answerConfirm(order.id, false, note.trim()),
                        () => {
                          dispatch({ type: "order/update", id: order.id, patch: { adjustNote: note.trim() } });
                          setStatus("INSPECTING");
                          setAdjusting(false);
                        },
                        "조정 요청을 보냈어요. 다시 맞춰서 보내 드릴게요.",
                      )
                    }
                  >
                    요청 보내기
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid gap-2">
                <Button
                  onClick={() =>
                    act(() => answerConfirm(order.id, true), () => setStatus("IN_PROGRESS"), "승인했어요. 작업을 시작할게요.")
                  }
                >
                  이대로 진행할게요
                </Button>
                <Button variant="secondary" size="md" onClick={() => setAdjusting(true)}>
                  조정 요청
                </Button>
              </div>
            )}
          </Card>
        ) : null}

        {order.status === "IN_PROGRESS" ? (
          <Card>
            <h2 className="flex items-center gap-2 text-[17px] font-bold">
              <Scissors size={18} className="text-accent" /> 리폼 작업 중이에요
            </h2>
            <p className="mt-1 text-[13.5px] text-muted">작업 전·중·후 사진을 남기고, 끝나면 시안과 나란히 비교해 검사해요.</p>
          </Card>
        ) : null}

        {order.status === "OUTBOUND_TRANSIT" ? (
          <Card>
            <h2 className="flex items-center gap-2 text-[17px] font-bold">
              <Truck size={18} className="text-accent" /> 다시 보내 드렸어요
            </h2>
            <p className="mt-1 text-[13.5px] text-muted">
              {order.outbound ? `${order.outbound.carrier} · ${order.outbound.number}` : "CJ대한통운 · 6843 2210 9071 (예시)"}
            </p>
          </Card>
        ) : null}

        {order.status === "DELIVERED" ? (
          <Card>
            <h2 className="flex items-center gap-2 text-[17px] font-bold">
              <PackageCheck size={18} className="text-accent" /> 리폼한 옷이 도착했어요
            </h2>
            <p className="mt-1 text-[13.5px] text-muted">받은 옷이 시안과 얼마나 같았나요?</p>
            <div className="mt-3 flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n}점`}
                  onClick={() =>
                    act(
                      () => rateOrder(order.id, n),
                      () => dispatch({ type: "order/update", id: order.id, patch: { rating: n } }),
                      "소중한 평가 고마워요. 다음 시안을 더 정확하게 만드는 데 써요.",
                    )
                  }
                  className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-white"
                >
                  <Star size={20} className={(order.rating ?? 0) >= n ? "fill-sun text-sun" : "text-[#cfc7bb]"} />
                </button>
              ))}
            </div>
          </Card>
        ) : null}
      </section>

      {CANCELLABLE.includes(order.status) && !order.cancelRequestedAt ? (
        <section className="px-5 pt-5">
          {cancelOpen ? (
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="text-[14.5px] font-semibold">주문 취소 요청</div>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                리폼 작업을 시작하기 전까지 취소할 수 있어요. 담당자가 확인한 뒤 반송과 환불을 안내해 드려요.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                maxLength={500}
                placeholder="취소하시는 이유 (선택)"
                className="mt-2 h-20 w-full resize-none rounded-xl border border-line p-3 text-[14px] outline-none focus:border-ink"
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="md" onClick={() => setCancelOpen(false)}>
                  닫기
                </Button>
                <Button
                  size="md"
                  onClick={() =>
                    act(
                      () => requestCancel(order.id, cancelReason.trim()),
                      () => {
                        dispatch({
                          type: "order/update",
                          id: order.id,
                          patch: { cancelRequestedAt: nowMs(), cancelReason: cancelReason.trim() || undefined },
                        });
                        setCancelOpen(false);
                      },
                      "취소를 요청했어요. 담당자가 반송과 환불을 안내해 드려요.",
                    )
                  }
                >
                  취소 요청 보내기
                </Button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setCancelOpen(true)} className="w-full text-center text-[13px] font-semibold text-muted underline underline-offset-4">
              주문 취소 요청
            </button>
          )}
        </section>
      ) : null}

      <section className={cx("px-5 pt-5", order.status === "CANCELLED" && "hidden")}>
        <h2 className="text-[15px] font-bold">진행 상황</h2>
        <ol className="mt-3">
          {ORDER_STEPS.map((s, i) => {
            const done = i < current || order.status === "DELIVERED";
            const now = i === current && order.status !== "DELIVERED";
            const at = timeOf(s.status);
            return (
              <li key={s.status} className="relative flex gap-3 pb-4 last:pb-0">
                {i < ORDER_STEPS.length - 1 ? (
                  <span className={cx("absolute left-[11px] top-7 h-[calc(100%-1.5rem)] w-0.5", i < current ? "bg-ink/70" : "bg-[#e2dbcf]")} />
                ) : null}
                <span
                  className={cx(
                    "relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                    done ? "bg-ink text-white" : now ? "bg-accent text-white ring-4 ring-accent/20" : "bg-white ring-1 ring-[#d9d1c4]",
                  )}
                >
                  {done ? <Check size={13} strokeWidth={3} /> : null}
                </span>
                <div className="-mt-0.5 min-w-0 flex-1">
                  <div className={cx("text-[14.5px] font-semibold", !done && !now && "text-[#a79f93]")}>{s.label}</div>
                  <div className="text-[12.5px] text-muted">{at ? timeLabel(at) : s.desc}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 서버가 붙으면 다음 단계는 운영 콘솔에서만 넘긴다 */}
      <section className={cx("px-5 pb-10 pt-6", backendOn && "hidden")}>
        <div className="rounded-[20px] border border-dashed border-[#cfc6b8] bg-[#fbf9f5] p-4">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold">시연용 진행</span>
            <DemoTag />
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            택배·작업실 쪽에서 일어나는 단계를 넘겨 볼 수 있어요. 운영 콘솔을 다른 탭에서 열면 같은 주문이 함께 움직여요.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="dark" size="md" onClick={demoNext} disabled={order.status === "DELIVERED" || order.status === "CANCELLED"}>
              다음 단계로
            </Button>
            <Link
              href="/admin"
              target="_blank"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-white text-[14px] font-semibold"
            >
              운영 콘솔 열기
            </Link>
          </div>
        </div>
      </section>
      <Toast message={toast} />
    </PhoneFrame>
  );
}
