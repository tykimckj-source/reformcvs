"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { MockupStage } from "@/components/mockup-stage";
import { Badge, Button } from "@/components/ui";
import { sendManual, type ManualItem } from "@/lib/db";
import { colorOf, designBySlug } from "@/lib/designs";
import { timeLabel } from "@/lib/format";
import { PLACEMENT_LABEL } from "@/lib/garments";
import { preparePhoto } from "@/lib/image";

const EMPTY_DRAFT = { photo: null as File | null, note: "" };

/** 운영 콘솔의 수동 시안 큐: 손님이 디자이너에게 직접 요청한 시안. 기다리는 요청을 먼저, 오래된 것부터 보여 준다 */
export default function ManualQueue({ items, onSent, flash }: { items: ManualItem[]; onSent: () => Promise<unknown>; flash: (message: string) => void }) {
  const [drafts, setDrafts] = useState<Record<string, typeof EMPTY_DRAFT>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const waiting = items.filter((i) => !i.request.doneAt);
  const sent = items.filter((i) => i.request.doneAt).sort((a, b) => (b.request.doneAt ?? 0) - (a.request.doneAt ?? 0));

  const draftOf = (id: string) => drafts[id] ?? EMPTY_DRAFT;
  const setDraft = (id: string, patch: Partial<typeof EMPTY_DRAFT>) => setDrafts({ ...drafts, [id]: { ...draftOf(id), ...patch } });

  const send = async (item: ManualItem) => {
    const draft = draftOf(item.session.id);
    if (!draft.photo) return flash("보낼 시안 이미지를 골라 주세요");
    setBusy(item.session.id);
    try {
      const blob = await (await fetch((await preparePhoto(draft.photo)).dataUrl)).blob();
      await sendManual(item.request, blob, draft.note);
      await onSent();
      flash("디자이너 시안을 보냈어요");
    } catch (e) {
      flash(e instanceof Error ? e.message : "시안을 보내지 못했어요");
    } finally {
      setBusy(null);
    }
  };

  // 손님 계정은 브라우저마다 따로라, 요청했던 브라우저에서 열어야 보인다고 함께 알린다
  const copyMessage = async (item: ManualItem) => {
    const text = `[리폼 편의점] 요청하신 디자이너 시안이 도착했어요. 시안을 요청했던 휴대폰 브라우저에서 아래 주소를 열면 볼 수 있어요.\n${window.location.origin}/m/${item.session.id}`;
    try {
      await navigator.clipboard.writeText(text);
      flash("문구를 복사했어요. 문자로 보내 주세요");
    } catch {
      flash("복사하지 못했어요");
    }
  };

  const card = (item: ManualItem) => {
    const { request, session, garment } = item;
    const design = designBySlug(session.designSlug);
    const draft = draftOf(session.id);
    return (
      <li key={session.id} className="grid gap-4 rounded-2xl border border-line bg-white p-4 md:grid-cols-[180px_1fr]">
        <div className="w-[180px] max-w-full">
          <MockupStage garment={garment} layers={[{ designSlug: session.designSlug, options: session.options }]} rounded="rounded-xl" />
        </div>
        <div className="min-w-0 space-y-2 text-[13.5px]">
          <div className="flex flex-wrap items-center gap-2">
            <b className="text-[15px]">{design?.name ?? session.designSlug}</b>
            <Badge>{timeLabel(request.requestedAt)} 요청</Badge>
            {request.doneAt ? <Badge tone="ok">{timeLabel(request.doneAt)} 보냄</Badge> : null}
          </div>
          <div className="text-muted">
            {garment.name} · {PLACEMENT_LABEL[session.options.placement]} · {session.options.sizeCm.toFixed(1)}cm
            {design ? ` · ${colorOf(design, session.options.colorId).label}` : ""}
          </div>
          <p className="rounded-xl bg-[#f7f4ee] p-3">{request.note ?? "바라는 점은 적지 않았어요"}</p>
          <div className="flex flex-wrap items-center gap-2 text-muted">
            {request.phone ? `연락처 ${request.phone}` : "연락처를 남기지 않았어요. 손님이 그 화면을 다시 열면 보여요."}
            {request.phone && request.doneAt ? (
              <Button variant="secondary" size="sm" onClick={() => copyMessage(item)}>
                <Copy size={14} /> 알림 문구 복사
              </Button>
            ) : null}
          </div>
          {request.doneAt ? (
            <div className="flex flex-wrap items-start gap-3">
              {request.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={request.image} alt="보낸 디자이너 시안" className="w-[140px] rounded-xl" />
              ) : null}
              {request.replyNote ? <p className="min-w-0 flex-1">{request.replyNote}</p> : null}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-[12.5px] font-semibold">
                만든 시안 이미지
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDraft(session.id, { photo: e.target.files?.[0] ?? null })}
                  className="mt-1 block w-full text-[13px] font-normal"
                />
              </label>
              <textarea
                value={draft.note}
                onChange={(e) => setDraft(session.id, { note: e.target.value })}
                placeholder="손님에게 전할 말 (예: 원하신 대로 자수를 6cm로 줄였어요)"
                className="h-16 w-full resize-none rounded-xl border border-line p-3 text-[13.5px] outline-none focus:border-ink"
              />
              <Button size="md" disabled={busy === session.id || !draft.photo} onClick={() => send(item)}>
                시안 보내기
              </Button>
            </div>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="mt-6 space-y-8">
      <section>
        <h2 className="text-[16px] font-bold">기다리는 요청 {waiting.length}건</h2>
        <ul className="mt-3 space-y-3">
          {waiting.map(card)}
          {waiting.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-[#d3cabb] px-4 py-8 text-center text-[13px] text-muted">기다리는 요청이 없어요</li>
          ) : null}
        </ul>
      </section>
      {sent.length ? (
        <section>
          <h2 className="text-[16px] font-bold">보낸 시안 {sent.length}건</h2>
          <ul className="mt-3 space-y-3">{sent.map(card)}</ul>
        </section>
      ) : null}
    </div>
  );
}
