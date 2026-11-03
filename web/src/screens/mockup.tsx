"use client";

import { CircleCheck, Columns2, Download, LoaderCircle, Move, Sparkles, ThumbsDown, ThumbsUp, X, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { BottomBar, Missing, PhoneFrame, ScreenSkeleton, TopBar } from "@/components/app-frame";
import { MockupStage } from "@/components/mockup-stage";
import { Badge, Button, Card, Chip, DemoTag, Label, Toast } from "@/components/ui";
import { backendOn, requestManual as askDesigner } from "@/lib/db";
import { checkDesign, designBySlug, priceLines, sumLines } from "@/lib/designs";
import { cx, newId, won, nowMs } from "@/lib/format";
import { PLACEMENT_LABEL } from "@/lib/garments";
import { downloadDataUrl, renderComposite, type Framing } from "@/lib/render";
import { dispatch, useIsClient, useStore } from "@/lib/store";
import type { MockupOptions } from "@/lib/types";

type Candidate = { id: string; label: string; note: string; image: string; options: MockupOptions };
type Gen = { phase: "idle" | "running" | "done"; step: number; items: Candidate[] };
const IDLE: Gen = { phase: "idle", step: 0, items: [] };
const GEN_STEPS = ["배치 영역 계산", "후보 3장 생성", "원본 복원 합성", "품질 검사"];

export default function MockupScreen() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const isClient = useIsClient();
  const { sessions, garments, manual } = useStore();
  const session = sessions[sessionId];
  const designerMockup = manual[sessionId];
  const garment = session ? garments[session.garmentId] : undefined;
  const design = session ? designBySlug(session.designSlug) : undefined;

  const [compare, setCompare] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [gen, setGen] = useState<Gen>(IDLE);
  const [viewer, setViewer] = useState<Candidate | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [manualForm, setManualForm] = useState<{ note: string; phone: string } | null>(null);
  const timers = useRef<number[]>([]);
  const run = useRef(0);

  const stopGeneration = () => {
    run.current += 1;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  // 다른 화면으로 이동해 이 화면이 숨겨지면 진행 중인 생성과 열린 창을 정리한다
  useLayoutEffect(
    () => () => {
      run.current += 1;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      setGen((g) => (g.phase === "running" ? IDLE : g));
      setViewer(null);
    },
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!isClient) return <ScreenSkeleton />;
  if (!session || !garment || !design) return <Missing what="시안" />;

  const availability = checkDesign(design, garment);
  const placements = availability.ok ? availability.placements : [];
  const o = session.options;
  const lines = priceLines(design, o);
  const total = sumLines(lines);
  const fill = ((o.sizeCm - design.size.min) / (design.size.max - design.size.min)) * 100;

  const update = (patch: Partial<MockupOptions>) => {
    dispatch({ type: "session/update", id: session.id, patch: { options: { ...o, ...patch } } });
    if (gen.phase !== "idle") {
      stopGeneration();
      setGen(IDLE);
    }
  };

  const generate = async () => {
    stopGeneration();
    const my = run.current;
    setGen({ phase: "running", step: 0, items: [] });
    const alt = design.colors.find((c) => c.id !== o.colorId) ?? design.colors[0];
    const variants: { id: string; label: string; note: string; framing: Framing; options: MockupOptions }[] = [
      { id: "c1", label: "후보 1", note: "전체 모습", framing: "full", options: o },
      { id: "c2", label: "후보 2", note: "가까이 본 모습", framing: "close", options: o },
      { id: "c3", label: "후보 3", note: `${alt.label} 색 제안`, framing: "close", options: { ...o, colorId: alt.id } },
    ];
    let items: Candidate[];
    try {
      items = await Promise.all(
        variants.map(async (v) => ({
          id: v.id,
          label: v.label,
          note: v.note,
          options: v.options,
          image: await renderComposite(garment, design, v.options, v.framing),
        })),
      );
    } catch {
      if (run.current === my) {
        setGen(IDLE);
        setToast("시안을 만들지 못했어요. 다시 시도해 주세요.");
      }
      return;
    }
    if (run.current !== my) return;
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    at(600, () => setGen((g) => ({ ...g, step: 1 })));
    at(2200, () => setGen((g) => ({ ...g, step: 2 })));
    at(2900, () => setGen((g) => ({ ...g, step: 3 })));
    items.forEach((item, i) => at(3500 + i * 700, () => setGen((g) => ({ ...g, items: [...g.items, item] }))));
    at(5100, () => setGen((g) => ({ ...g, phase: "done", step: 4 })));
  };

  const vote = (id: string, v: "up" | "down") => {
    const next = { ...session.feedback };
    if (next[id] === v) delete next[id];
    else next[id] = v;
    dispatch({ type: "session/update", id: session.id, patch: { feedback: next } });
  };

  const save = async () => {
    setSaving(true);
    try {
      downloadDataUrl(await renderComposite(garment, design, o, "full"), `리폼시안-${design.name}.jpg`);
      setToast("시안 이미지를 저장했어요. 'AI 예시' 표시가 함께 들어가요.");
    } catch {
      setToast("이미지를 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  };

  const requestManual = () => {
    // 서버가 있으면 바라는 점과 연락처를 받아 실제로 운영 콘솔에 요청을 남긴다
    if (backendOn) return setManualForm({ note: "", phone: "" });
    dispatch({ type: "session/update", id: session.id, patch: { manualRequested: true } });
    setToast("디자이너에게 시안을 요청했어요. 24시간 안에 알림톡으로 보내 드려요.");
  };

  const sendManualRequest = async () => {
    if (!manualForm) return;
    try {
      await askDesigner(garment, session, manualForm.note, manualForm.phone);
      dispatch({
        type: "manual/add",
        manual: { sessionId: session.id, note: manualForm.note.trim() || undefined, phone: manualForm.phone.trim() || undefined, requestedAt: nowMs() },
      });
      setManualForm(null);
      setToast("디자이너에게 요청했어요. 시안이 오면 이 화면에서 볼 수 있어요.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "요청을 보내지 못했어요");
    }
  };

  const order = () => {
    const quote = { id: newId("q"), sessionId: session.id, lines, total, leadDays: design.leadDays, createdAt: nowMs() };
    dispatch({ type: "quote/add", quote });
    router.push(`/checkout/${quote.id}`);
  };

  const progress = gen.phase === "done" ? 100 : Math.max(6, ((gen.step + gen.items.length / 3) / 5) * 100);

  return (
    <PhoneFrame>
      <TopBar
        title="시안 만들기"
        step={3}
        right={
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-black/5"
            aria-label="시안 이미지 저장"
          >
            {saving ? <LoaderCircle size={20} className="animate-spin" /> : <Download size={20} />}
          </button>
        }
      />

      <section className="px-4 pt-1">
        <MockupStage
          garment={garment}
          layers={[{ designSlug: design.slug, options: o }]}
          editable={!compare}
          compare={compare}
          zoom={zoom}
          badge
          onMove={(_, pos) => update({ pos })}
        />
        <div className="mt-3 flex items-center gap-2">
          <Chip
            active={compare}
            onClick={() => {
              setCompare((v) => !v);
              setZoom(false);
            }}
          >
            <Columns2 size={16} /> 원본과 비교
          </Chip>
          <Chip
            active={zoom}
            onClick={() => {
              setZoom((v) => !v);
              setCompare(false);
            }}
          >
            {zoom ? <ZoomOut size={16} /> : <ZoomIn size={16} />} 크게 보기
          </Chip>
          {!compare && !zoom ? (
            <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-muted">
              <Move size={13} /> 끌어서 옮기기
            </span>
          ) : null}
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Badge tone="accent">{design.typeLabel}</Badge>
              <span className="text-[12px] text-muted">작업 {design.leadDays}일</span>
            </div>
            <h2 className="mt-1 text-[21px] font-bold tracking-[-0.01em]">{design.name}</h2>
            <p className="text-[13.5px] text-muted">{design.summary}</p>
          </div>
          <Link
            href={`/g/${garment.id}/designs`}
            className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold hover:border-ink/25"
          >
            다른 디자인
          </Link>
        </div>
      </section>

      <section className="space-y-3 px-5 pt-4">
        <Card>
          <Label>위치</Label>
          <div className="flex flex-wrap gap-2">
            {placements.map((p) => (
              <Chip key={p} active={o.placement === p} onClick={() => update({ placement: p, pos: garment.anchors[p] ?? o.pos })}>
                {PLACEMENT_LABEL[p]}
              </Chip>
            ))}
          </div>
        </Card>
        <Card>
          <Label hint={o.sizeCm > design.size.largeOver ? `큰 사이즈 +${won(design.size.largeFee)}` : `${design.size.min}–${design.size.max}cm`}>
            크기 <span className="ml-1 text-accent">{o.sizeCm.toFixed(1)}cm</span>
          </Label>
          <input
            type="range"
            aria-label="디자인 크기"
            className="size-range w-full"
            min={design.size.min}
            max={design.size.max}
            step={design.size.step}
            value={o.sizeCm}
            style={{ "--fill": `${fill}%` } as CSSProperties}
            onChange={(e) => update({ sizeCm: Number(e.target.value) })}
          />
          <p className="mt-1 text-[12px] text-muted">사진으로 추정한 크기예요. 옷이 도착하면 실측해서 맞춰요.</p>
        </Card>
        <Card>
          <Label>{design.type === "print" ? "잉크 색" : design.type === "embroidery" ? "실 색" : "색상"}</Label>
          <div className="flex flex-wrap gap-4">
            {design.colors.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={o.colorId === c.id}
                onClick={() => update({ colorId: c.id })}
                className="flex flex-col items-center gap-1.5 text-[12px]"
              >
                <span
                  className={cx("h-10 w-10 rounded-full ring-1 ring-black/10 transition", o.colorId === c.id && "ring-2 ring-ink ring-offset-2")}
                  style={{ background: c.hex2 ? `linear-gradient(135deg, ${c.hex} 50%, ${c.hex2} 50%)` : c.hex }}
                />
                <span className={o.colorId === c.id ? "font-semibold text-ink" : "text-muted"}>{c.label}</span>
              </button>
            ))}
          </div>
        </Card>
        {design.text ? (
          <Card>
            <Label hint={`영문 ${design.text.max}자까지`}>이니셜</Label>
            <input
              value={o.text}
              maxLength={design.text.max}
              onChange={(e) => update({ text: e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, design.text?.max ?? 3) })}
              placeholder="예: JH"
              aria-label="이니셜"
              className="h-12 w-full rounded-xl border border-line px-3.5 text-[18px] font-semibold uppercase tracking-[.2em] outline-none focus:border-ink"
            />
          </Card>
        ) : null}
      </section>

      <section className="px-5 pt-6">
        {designerMockup?.doneAt ? (
          <Card className="mb-3">
            <div className="text-[16px] font-bold">디자이너 시안</div>
            {designerMockup.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={designerMockup.image} alt="디자이너가 내 옷에 맞춰 만든 시안" className="mt-2 w-full rounded-2xl" />
            ) : null}
            {designerMockup.replyNote ? <p className="mt-2 text-[13.5px] leading-relaxed">{designerMockup.replyNote}</p> : null}
          </Card>
        ) : null}
        <Card>
          <div className="flex items-center gap-1.5 text-[16px] font-bold">
            <Sparkles size={17} className="text-accent" /> AI 정밀 시안 <DemoTag />
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            원단 질감과 조명을 맞춘 후보 3장을 만들어요. 디자인 바깥은 원본 사진 그대로 지켜요.
          </p>

          {gen.phase === "idle" ? (
            <Button variant="dark" className="mt-3 w-full" onClick={generate}>
              <Sparkles size={17} /> AI 시안 3장 만들기
            </Button>
          ) : (
            <>
              {gen.phase === "running" ? (
                <>
                  <ol className="mt-3 space-y-1.5">
                    {GEN_STEPS.map((label, i) => (
                      <li key={label} className={cx("flex items-center gap-2 text-[13.5px]", i <= gen.step ? "text-ink" : "text-[#b9b1a5]")}>
                        {i < gen.step ? (
                          <CircleCheck size={16} className="text-ok" />
                        ) : i === gen.step ? (
                          <LoaderCircle size={16} className="animate-spin text-accent" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-[#d6cfc4]" />
                        )}
                        {label}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#efe9df]">
                    <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                </>
              ) : null}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => {
                  const item = gen.items[i];
                  if (!item) return <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-[#efe9df]" />;
                  return (
                    <div key={item.id} className="animate-rise">
                      <button
                        type="button"
                        onClick={() => setViewer(item)}
                        className="relative block w-full overflow-hidden rounded-xl ring-1 ring-line"
                        aria-label={`${item.label} 크게 보기`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt="" className="aspect-[3/4] w-full object-cover" />
                        <span className="absolute left-1 top-1 rounded bg-white/90 px-1 py-px text-[10.5px] font-bold text-ok">검사 통과</span>
                      </button>
                      <div className="mt-1.5 text-[12.5px] font-semibold">{item.label}</div>
                      <div className="truncate text-[11.5px] text-muted">{item.note}</div>
                      <div className="mt-1 flex gap-1">
                        <button
                          type="button"
                          onClick={() => vote(item.id, "up")}
                          aria-label="좋아요"
                          aria-pressed={session.feedback[item.id] === "up"}
                          className={cx("grid h-8 flex-1 place-items-center rounded-lg border", session.feedback[item.id] === "up" ? "border-ink bg-ink text-white" : "border-line bg-white text-muted")}
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => vote(item.id, "down")}
                          aria-label="별로예요"
                          aria-pressed={session.feedback[item.id] === "down"}
                          className={cx("grid h-8 flex-1 place-items-center rounded-lg border", session.feedback[item.id] === "down" ? "border-ink bg-ink text-white" : "border-line bg-white text-muted")}
                        >
                          <ThumbsDown size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {gen.phase === "done" ? (
                <button type="button" onClick={generate} className="mt-3 text-[13px] font-semibold text-muted underline underline-offset-4">
                  다시 만들기
                </button>
              ) : null}
            </>
          )}
          <p className="mt-3 text-[11.5px] leading-relaxed text-[#9a9389]">
            시안 단계라 화면 합성으로 예시를 보여 드려요. 서비스에서는 생성 AI가 만들고 자동 검사를 통과한 시안만 보여요.
          </p>
        </Card>
        {designerMockup || session.manualRequested ? (
          <p className="mt-3 py-2 text-center text-[13.5px] font-semibold text-muted">
            {designerMockup?.doneAt ? "디자이너 시안이 도착했어요. 위에서 확인해 보세요" : "디자이너 시안을 요청했어요. 보통 24시간 안에 이 화면에 도착해요"}
          </p>
        ) : manualForm ? (
          <Card className="mt-3">
            <div className="text-[14.5px] font-semibold">디자이너에게 직접 요청</div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">디자이너가 내 옷 사진에 맞춰 시안을 만들어 이 화면으로 보내 드려요.</p>
            <textarea
              value={manualForm.note}
              onChange={(e) => setManualForm({ ...manualForm, note: e.target.value })}
              maxLength={500}
              placeholder="바라는 점 (예: 자수를 조금 더 작게, 소매 쪽으로)"
              className="mt-2 h-20 w-full resize-none rounded-xl border border-line p-3 text-[14px] outline-none focus:border-ink"
            />
            <input
              value={manualForm.phone}
              onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
              inputMode="tel"
              maxLength={20}
              aria-label="완성되면 알려 드릴 연락처"
              placeholder="완성되면 알려 드릴 연락처 (선택)"
              className="mt-2 h-11 w-full rounded-xl border border-line px-3 text-[14px] outline-none focus:border-ink"
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button variant="secondary" size="md" onClick={() => setManualForm(null)}>
                닫기
              </Button>
              <Button size="md" onClick={sendManualRequest}>
                요청 보내기
              </Button>
            </div>
          </Card>
        ) : (
          <button type="button" onClick={requestManual} className="mt-3 w-full py-2 text-center text-[13.5px] font-semibold text-muted underline underline-offset-4">
            원하는 시안이 아닌가요? 디자이너에게 직접 요청하기
          </button>
        )}
      </section>

      <div className="h-6" />
      <BottomBar>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] text-muted">예상 금액 · 반송비 포함</div>
            <div className="text-[21px] font-extrabold tracking-[-0.01em]">{won(total)}</div>
          </div>
          <Button className="w-[56%]" onClick={order}>
            주문하기
          </Button>
        </div>
      </BottomBar>

      {viewer ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/85 p-4" role="dialog" aria-modal="true" aria-label={viewer.label}>
          <div className="mx-auto flex w-full max-w-[440px] items-center justify-between text-white">
            <span className="text-[15px] font-semibold">
              {viewer.label} · {viewer.note}
            </span>
            <button type="button" onClick={() => setViewer(null)} aria-label="닫기" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
              <X size={22} />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewer.image} alt={`${viewer.label} 시안`} className="max-h-full max-w-full rounded-2xl" />
          </div>
          <div className="mx-auto grid w-full max-w-[400px] grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setViewer(null)}>
              닫기
            </Button>
            <Button
              onClick={() => {
                const changed = viewer.options.colorId !== o.colorId;
                if (changed) update(viewer.options);
                setViewer(null);
                setToast(changed ? "이 시안의 색으로 바꿨어요" : "이 시안으로 주문할 수 있어요");
              }}
            >
              이 시안으로 정하기
            </Button>
          </div>
        </div>
      ) : null}
      <Toast message={toast} />
    </PhoneFrame>
  );
}
