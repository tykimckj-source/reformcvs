"use client";

import { Check, CreditCard, LoaderCircle, MessageCircle, ShieldCheck, Store } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BottomBar, Missing, PhoneFrame, ScreenSkeleton, TopBar } from "@/components/app-frame";
import { MockupStage } from "@/components/mockup-stage";
import { Button, Card, DemoTag, Label, TextField } from "@/components/ui";
import { backendOn, placeOrder } from "@/lib/db";
import { colorOf, designBySlug } from "@/lib/designs";
import { cx, newId, won, nowMs } from "@/lib/format";
import { PLACEMENT_LABEL } from "@/lib/garments";
import { dispatch, refresh, useIsClient, useStore } from "@/lib/store";
import type { Order } from "@/lib/types";

const METHODS = [
  { id: "card", label: "신용·체크카드" },
  { id: "tosspay", label: "토스페이" },
  { id: "kakaopay", label: "카카오페이" },
  { id: "naverpay", label: "네이버페이" },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function CheckoutScreen() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const router = useRouter();
  const isClient = useIsClient();
  const { quotes, sessions, garments, user } = useStore();
  const [form, setForm] = useState({ name: "김리폼", phone: "010-1234-5678", address: "서울시 마포구 월드컵로 00, 101동 1001호" });
  const [agree, setAgree] = useState({ custom: false, ai: false, learn: false });
  const [method, setMethod] = useState("card");
  const [paying, setPaying] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quote = quotes[quoteId];
  const session = quote ? sessions[quote.sessionId] : undefined;
  const garment = session ? garments[session.garmentId] : undefined;
  const design = session ? designBySlug(session.designSlug) : undefined;

  if (!isClient) return <ScreenSkeleton />;
  if (!quote || !session || !garment || !design) return <Missing what="견적" />;

  const o = session.options;
  const ready = !!user && agree.custom && agree.ai && form.name.trim() && form.phone.trim() && form.address.trim();

  const login = () => {
    setLoggingIn(true);
    window.setTimeout(() => {
      dispatch({ type: "user/login", name: form.name });
      setLoggingIn(false);
    }, 700);
  };

  const pay = async () => {
    if (!ready) return;
    setPaying(true);
    setError(null);
    if (backendOn) {
      try {
        const order = await placeOrder({ garment, session, quote, customer: form, consents: agree });
        dispatch({ type: "order/add", order });
        void refresh();
        router.replace(`/orders/${order.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "주문을 만들지 못했어요");
        setPaying(false);
      }
      return;
    }
    window.setTimeout(() => {
      const now = nowMs();
      const d = new Date(now);
      const order: Order = {
        id: newId("o"),
        orderNo: `R${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}${Math.floor(1000 + Math.random() * 9000)}`,
        quoteId: quote.id,
        sessionId: session.id,
        total: quote.total,
        status: "AWAITING_SHIPMENT",
        history: [
          { status: "PAID", at: now },
          { status: "AWAITING_SHIPMENT", at: now },
        ],
        customer: { ...form },
        createdAt: now,
      };
      dispatch({ type: "order/add", order });
      router.replace(`/orders/${order.id}`);
    }, 1300);
  };

  return (
    <PhoneFrame>
      <TopBar title="주문하기" step={4} />

      <section className="px-5 pt-1">
        <Card className="flex gap-3.5 p-3">
          <div className="w-[92px] shrink-0">
            <MockupStage garment={garment} layers={[{ designSlug: design.slug, options: o }]} rounded="rounded-xl" />
          </div>
          <div className="min-w-0 flex-1 py-1">
            <div className="text-[16px] font-bold">{design.name}</div>
            <div className="mt-0.5 text-[13px] text-muted">{garment.name}</div>
            <ul className="mt-2 space-y-0.5 text-[13px]">
              <li>위치 · {PLACEMENT_LABEL[o.placement]}</li>
              <li>크기 · {o.sizeCm.toFixed(1)}cm</li>
              <li>
                색상 · {colorOf(design, o.colorId).label}
                {o.text ? ` · "${o.text}"` : ""}
              </li>
            </ul>
          </div>
        </Card>
      </section>

      <section className="px-5 pt-3">
        <Card>
          <Label>결제 금액</Label>
          <ul className="space-y-1.5 text-[14px]">
            {quote.lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-3">
                <span className="text-muted">{l.label}</span>
                <span>{won(l.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-line pt-3">
            <span className="text-[14px] font-semibold">합계 (부가세 포함)</span>
            <span className="text-[20px] font-extrabold">{won(quote.total)}</span>
          </div>
          <p className="mt-2 text-[12px] text-muted">가격은 시안용 예시예요. 실물 검수 후 작업이 달라지면 재견적을 보내 드리고, 승인해야만 진행해요.</p>
        </Card>
      </section>

      <section className="px-5 pt-3">
        <Card>
          <Label>로그인</Label>
          {user ? (
            <div className="flex items-center gap-2 text-[14.5px]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#fee500] text-[#191919]">
                <MessageCircle size={16} />
              </span>
              <span>
                <b>{user.name}</b>님 카카오 계정으로 주문해요
              </span>
            </div>
          ) : (
            <>
              <p className="mb-3 text-[13.5px] text-muted">주문은 로그인 후에 할 수 있어요. 지금까지 만든 시안은 계정에 그대로 남아요.</p>
              <Button variant="kakao" className="w-full" onClick={login} disabled={loggingIn}>
                {loggingIn ? <LoaderCircle size={18} className="animate-spin" /> : <MessageCircle size={18} />} 카카오로 계속하기
              </Button>
            </>
          )}
        </Card>
      </section>

      <section className="px-5 pt-3">
        <Card>
          <Label>리폼한 옷을 받을 곳</Label>
          <div className="space-y-3">
            <TextField label="받는 분" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="연락처" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="주소" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
        </Card>
      </section>

      <section className="px-5 pt-3">
        <Card className="bg-[#fbf9f5]">
          <div className="flex items-start gap-2.5">
            <Store size={19} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <div className="text-[14.5px] font-semibold">결제 후 옷은 편의점 택배로 보내 주세요</div>
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted">보낼 주소와 포장 방법은 주문 화면과 알림톡으로 안내해 드려요.</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="px-5 pt-3">
        <Card>
          <Label>약관 동의</Label>
          <ul className="space-y-2.5">
            {(
              [
                ["custom", "[필수] 맞춤 제작이라 작업을 시작한 뒤에는 주문을 취소할 수 없어요"],
                ["ai", "[필수] 시안은 AI 예시 이미지이며 실물과 다를 수 있어요"],
                ["learn", "[선택] 완성 전·후 사진을 디자인 품질 개선(AI 학습)에 써도 돼요"],
              ] as const
            ).map(([key, text]) => (
              <li key={key}>
                <button type="button" onClick={() => setAgree({ ...agree, [key]: !agree[key] })} className="flex w-full items-start gap-2.5 text-left text-[13.5px] leading-snug">
                  <span
                    className={cx(
                      "mt-px grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                      agree[key] ? "border-ink bg-ink text-white" : "border-[#cfc7bb] bg-white",
                    )}
                  >
                    {agree[key] ? <Check size={13} strokeWidth={3} /> : null}
                  </span>
                  {text}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="px-5 pb-8 pt-3">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[14px] font-semibold">결제 수단</span>
            <DemoTag>토스페이먼츠 결제위젯 자리</DemoTag>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={cx(
                  "flex h-12 items-center justify-center gap-1.5 rounded-xl border text-[14px] font-semibold transition",
                  method === m.id ? "border-ink bg-ink text-white" : "border-line bg-white",
                )}
              >
                {m.id === "card" ? <CreditCard size={16} /> : null}
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-muted">
            <ShieldCheck size={14} /> 시안에서는 실제 결제가 일어나지 않아요
          </p>
        </Card>
      </section>

      <BottomBar>
        {error ? <p className="mb-2 text-center text-[13px] font-semibold text-[#c2412d]">{error}</p> : null}
        <Button className="w-full" disabled={!ready || paying} onClick={pay}>
          {paying ? (
            <>
              <LoaderCircle size={19} className="animate-spin" /> 결제 승인 중
            </>
          ) : !user ? (
            "로그인 후 결제할 수 있어요"
          ) : !agree.custom || !agree.ai ? (
            "필수 약관에 동의해 주세요"
          ) : (
            `${won(quote.total)} 결제하기`
          )}
        </Button>
      </BottomBar>
    </PhoneFrame>
  );
}
