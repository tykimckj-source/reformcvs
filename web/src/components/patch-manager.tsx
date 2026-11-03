"use client";

import { useState, type FormEvent } from "react";
import type { Product } from "./patch-shop";

export function PatchManager({ products, changes, save, reset }: { products: Product[]; changes: Product[]; save: (product: Product) => void; reset: (id: string) => void }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [cost, setCost] = useState("1000");
  const [category, setCategory] = useState<Product["category"]>("장식 패치");
  const [photo, setPhoto] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  function choose(id: string) {
    const p = products.find(p => p.id === id) || null;
    setEditing(p); setName(p?.name || ""); setCost(String(p?.cost ?? (p?.back ? 3000 : 1000)));
    setCategory(p?.category || "장식 패치"); setPhoto(p?.image || ""); setMessage("");
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!editing && !photo) { setMessage("새 패치의 사진을 먼저 선택해 주세요."); return; }
    const value = Number(cost);
    if (!name.trim() || !Number.isInteger(value) || value < 0 || value > 1000000) { setMessage("이름과 0~1,000,000원의 정수 가격을 입력해 주세요."); return; }
    try {
      const product: Product = { ...(editing || { id: `custom-${crypto.randomUUID()}`, box: [0, 0, 1, 1] as [number, number, number, number] }), name: name.trim(), category, cost: value, ...(photo ? { image: photo } : {}) };
      save(product); setEditing(product);
      setMessage("작업 초안을 저장했어요. 아래 미리보기에 반영되며 고객 화면은 아직 바뀌지 않습니다.");
    } catch { setMessage("저장 공간이 부족하거나 브라우저 저장이 차단됐어요. 사진 용량을 줄여 다시 시도해 주세요."); }
  }
  return <details open className="mb-6 rounded-2xl border border-line bg-white p-4">
    <summary className="cursor-pointer font-semibold">판매할 패치 등록·수정 · 작업 초안</summary>
    <p className="mt-3 text-xs leading-5 text-muted">현재는 작업 컴퓨터에서 초안을 만드는 편집 화면입니다. 사진·이름·가격을 저장한 뒤 상품 파일을 내려받아 사이트 작업자에게 전달하세요. 관리용 로그인과 공용 저장소 연결 전까지는 이 화면에서 직접 공개할 수 없습니다.</p>
    <form onSubmit={submit} className="mt-4 grid gap-3 text-sm">
      <label>수정할 패치<select value={editing?.id || ""} onChange={e => choose(e.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-line p-2"><option value="">새 패치 등록</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label>패치 이름<input required maxLength={60} value={name} onChange={e => setName(e.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-line p-2" /></label>
      <label>가격 (원)<input required type="number" min={0} max={1000000} step={1} value={cost} onChange={e => setCost(e.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-line p-2" /></label>
      <label>종류<select value={category} onChange={e => setCategory(e.target.value as Product["category"])} className="mt-1 block min-h-11 w-full rounded-lg border border-line p-2">{["눈 모양", "장식 패치", "전사지"].map(c => <option key={c}>{c}</option>)}</select></label>
      <label>사진 등록·교체<input type="file" accept="image/png,image/jpeg,image/webp" disabled={loading} className="mt-2 block w-full text-xs" onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return;
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 1024 * 1024) { setMessage("PNG·JPG·WEBP 사진을 1MB 이하로 선택해 주세요."); e.target.value = ""; return; }
        setLoading(true); setMessage("");
        try { const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); }); setPhoto(data); }
        catch { setMessage("사진을 읽지 못했어요. 다시 선택해 주세요."); }
        finally { setLoading(false); }
      }} /></label>
      <p className="text-xs text-muted">투명 배경 PNG를 권장합니다. 등록 사진의 배경을 자동으로 제거하지는 않습니다. 수정 시 사진을 선택하지 않으면 기존 사진을 유지합니다.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {photo && <img src={photo} alt="등록할 패치 미리보기" className="h-24 w-24 object-contain" />}
      <button disabled={loading} className="min-h-11 rounded-lg bg-[#293e32] p-3 font-semibold text-white disabled:opacity-40" type="submit">{editing ? "수정 초안 저장" : "새 상품 초안 저장"}</button>
      {editing && <button type="button" disabled={loading} className="min-h-11 text-sm underline" onClick={() => {
        try { reset(editing.id); choose(""); setMessage("이 브라우저에 저장한 변경을 지웠어요."); }
        catch { setMessage("브라우저 저장소에 접근할 수 없어 변경을 지우지 못했어요."); }
      }}>{editing.id.startsWith("custom-") ? "추가한 상품 초안 삭제" : "변경 초안 취소"}</button>}
      <p role="status" className="text-xs leading-5">{message}</p>
    </form>
    <div className="mt-4 border-t border-line pt-4">
      <button type="button" className="min-h-11 rounded-lg border border-line px-3 text-sm font-semibold" onClick={() => {
        const url = URL.createObjectURL(new Blob([JSON.stringify(changes, null, 2)], { type: "application/json" }));
        const link = document.createElement("a"); link.href = url; link.download = "patch-catalog.json"; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage("저장된 상품 초안을 내려받았어요. 사이트 작업자에게 전달하면 됩니다. 아직 고객에게 공개된 것은 아닙니다.");
      }}>저장된 상품 파일 내려받기</button>
      <p className="mt-2 text-xs leading-5 text-muted">사이트 작업자는 파일을 web/src/data/patch-catalog.json에 반영한 뒤 검토·배포합니다. 원본 사진은 덮어쓰지 않습니다. 저장하지 않은 입력은 파일에 포함되지 않습니다.</p>
    </div>
  </details>;
}
