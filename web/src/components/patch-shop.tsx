"use client";

import { useState } from "react";

type Product = { id: string; name: string; category: "눈 모양" | "장식 패치" | "전사지"; box: [number, number, number, number]; back?: boolean };
const products: Product[] = [
  { id: "eyes-lash", name: "속눈썹 눈 모양", category: "눈 모양", box: [125, 200, 190, 186] },
  { id: "eyes-up", name: "위쪽을 보는 눈", category: "눈 모양", box: [681, 167, 213, 151] },
  { id: "eyes-round", name: "동그란 눈", category: "눈 모양", box: [794, 456, 183, 154] },
  { id: "eyes-smile", name: "웃는 눈 모양", category: "눈 모양", box: [417, 516, 189, 173] },
  { id: "eyes-left", name: "옆을 보는 눈", category: "눈 모양", box: [43, 686, 177, 183] },
  { id: "eyes-down", name: "아래쪽 눈 모양", category: "눈 모양", box: [337, 842, 163, 130] },
  { id: "eyes-right", name: "오른쪽 표정 눈", category: "눈 모양", box: [790, 697, 179, 167] },
  { id: "eyes-bottom", name: "아래 속눈썹 눈", category: "눈 모양", box: [163, 1041, 205, 162] },
  { id: "eyes-pair", name: "눈썹 눈 모양", category: "눈 모양", box: [605, 1016, 183, 172] },
  { id: "whale", name: "밤하늘 고래", category: "장식 패치", box: [66, 407, 252, 248] },
  { id: "glasses", name: "풍경 선글라스", category: "장식 패치", box: [394, 395, 253, 114] },
  { id: "breathe", name: "JUST breathe", category: "장식 패치", box: [678, 316, 251, 138] },
  { id: "friends", name: "함께하는 친구들", category: "장식 패치", box: [615, 586, 193, 127] },
  { id: "fun", name: "JUST HAVE FUN", category: "장식 패치", box: [253, 657, 166, 184] },
  { id: "peace", name: "PEACE 레터링", category: "장식 패치", box: [452, 710, 315, 135] },
  { id: "rainbow", name: "무지개 가방", category: "장식 패치", box: [105, 866, 225, 174] },
  { id: "blue-car", name: "파란 자동차", category: "장식 패치", box: [558, 855, 227, 138] },
  { id: "van", name: "컬러 버스", category: "장식 패치", box: [382, 966, 231, 141] },
  { id: "flower", name: "컬러 꽃", category: "장식 패치", box: [775, 916, 218, 193] },
  { id: "bottle", name: "HAPPY POTION", category: "장식 패치", box: [34, 1020, 104, 198] },
  { id: "shoe", name: "파란 운동화", category: "장식 패치", box: [80, 1198, 219, 154] },
  { id: "wave", name: "달과 파도", category: "장식 패치", box: [355, 1115, 233, 239] },
  { id: "green-car", name: "초록 자동차", category: "장식 패치", box: [707, 1167, 218, 186] },
  { id: "sewing", name: "I’M OK 재봉 도구", category: "전사지", box: [265, 512, 535, 510], back: true },
];
const price = (p: Product) => p.back ? 3000 : 1000;
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

function DetailImage({ product }: { product: Product }) {
  const [x, y, width, height] = product.box;
  return <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white p-4"><div className="relative overflow-hidden" style={{ width: `${Math.min(1, width / height) * 72}%`, maxWidth: width, aspectRatio: `${width} / ${height}` }}>
    {/* Each product uses a transparent cutout sprite, displayed on white. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={`/cases/gray-recut/patch-cutout-${product.back ? "back" : "front"}.png`} alt={product.name} loading="lazy" className="absolute max-w-none" style={{ width: `${1024 / width * 100}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} />
  </div></div>;
}

export function PatchShop() {
  const [filter, setFilter] = useState("전체");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [includeRecut, setIncludeRecut] = useState(false);
  const [cart, setCart] = useState<{ quantities: Record<string, number>; recut: boolean } | null>(null);
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState("");
  const selected = products.filter(p => quantities[p.id] > 0);
  const total = selected.reduce((sum, p) => sum + price(p) * quantities[p.id], includeRecut ? 29000 : 0);
  const change = (id: string, delta: number) => { setQuantities(q => ({ ...q, [id]: Math.min(99, Math.max(0, (q[id] || 0) + delta)) })); setMessage(""); };
  const cartProducts = products.filter(p => cart && cart.quantities[p.id] > 0);
  const cartTotal = cartProducts.reduce((sum, p) => sum + price(p) * (cart?.quantities[p.id] || 0), cart?.recut ? 29000 : 0);
  return <section id="patch-shop" className="mx-5 mt-9 scroll-mt-5 border-t border-line pt-7" aria-labelledby="patch-shop-title">
    <p className="text-[11px] font-bold tracking-widest text-[#53634b]">CHOOSE YOUR PATCH</p>
    <h2 id="patch-shop-title" className="mt-2 text-[23px] font-bold">사진 속 장식 골라 담기</h2>
    <p className="mt-3 text-sm leading-6 text-muted">눈 모양부터 컬러 패치, 뒷판 전사지까지. 원하는 디자인만 선택하고, 다른 패치를 함께 담아 나만의 조합을 만들어 보세요.</p>
    <p className="mt-2 text-xs leading-5 text-muted">사진을 바탕으로 배경을 제거한 참고 이미지입니다. 실제 크기·소재·재고·부착 방식은 판매 전 확인 예정입니다.</p>
    <div aria-label="장식 종류" className="my-5 flex flex-wrap gap-2">{["전체", "눈 모양", "장식 패치", "전사지"].map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${filter === f ? "border-[#293e32] bg-[#293e32] text-white" : "border-line bg-white"}`}>{f}</button>)}</div>
    <div className="grid grid-cols-2 gap-x-3 gap-y-5">{products.filter(p => filter === "전체" || p.category === filter).map(p => <article key={p.id}>
      <DetailImage product={p} />
      <p className="mt-2 text-[11px] text-muted">{p.category}</p><h3 className="text-sm font-semibold">{p.name}</h3><p className="mt-1 text-sm font-bold">{won(price(p))}<span className="ml-1 text-[11px] font-normal text-muted">/ 개</span></p>
      <div className="mt-2 flex min-h-10 items-center justify-between rounded-lg border border-line bg-white"><button type="button" aria-label={`${p.name} 수량 줄이기`} disabled={!quantities[p.id]} onClick={() => change(p.id, -1)} className="h-11 w-11 disabled:opacity-25">−</button><output aria-label={`${p.name} 선택 수량`} className="text-sm font-semibold">{quantities[p.id] || 0}</output><button type="button" aria-label={`${p.name} 선택 추가`} disabled={quantities[p.id] >= 99} onClick={() => change(p.id, 1)} className="h-11 w-11 disabled:opacity-25">＋</button></div>
    </article>)}</div>
    <div className="mt-7 rounded-2xl bg-white p-4">
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={includeRecut} onChange={e => { setIncludeRecut(e.target.checked); setMessage(""); }} className="mt-1 h-4 w-4" /><span><strong>디자인 변경도 함께 선택</strong><span className="mt-1 block text-xs leading-5 text-muted">소매 재단·몸판 폭 변경 · 29,000원<br />선택하지 않으면 장식만 담습니다.</span></span></label>
      <h3 className="mt-5 font-semibold">현재 선택</h3>
      {!selected.length && !includeRecut ? <p className="mt-2 text-sm text-muted">마음에 드는 장식의 ＋를 눌러 주세요.</p> : <ul className="mt-3 space-y-2 text-sm">{selected.map(p => <li key={p.id} className="flex items-center justify-between gap-2"><span>{p.name} × {quantities[p.id]}</span><button type="button" onClick={() => setQuantities(q => ({ ...q, [p.id]: 0 }))} className="shrink-0 text-xs underline" aria-label={`${p.name} 선택 취소`}>빼기</button></li>)}{includeRecut && <li>디자인 변경 × 1</li>}</ul>}
      <p aria-live="polite" className="mt-5 flex justify-between border-t border-line pt-4 font-bold"><span>선택 합계</span><span>{won(total)}</span></p>
      <p className="mt-2 text-xs leading-5 text-muted">배송비·부착비는 미정이며 합계에 포함되지 않습니다.</p>
      <button type="button" disabled={total === 0} onClick={() => { setCart({ quantities: { ...quantities }, recut: includeRecut }); setReview(false); setMessage("선택한 구성으로 데모 장바구니를 업데이트했어요."); }} className="mt-4 min-h-12 w-full rounded-xl bg-[#293e32] px-4 py-3 font-semibold text-white disabled:opacity-35">선택 구성 장바구니에 담기</button>
      <p role="status" className="mt-2 text-xs leading-5 text-[#53634b]">{message}</p>
    </div>
    {cart && <div className="mt-5 rounded-2xl border border-line p-4" aria-label="패치 데모 장바구니"><h3 className="font-bold">장바구니 · 구매 데모</h3><ul className="mt-3 space-y-2 text-sm">{cartProducts.map(p => <li key={p.id} className="flex justify-between gap-2"><span>{p.name} × {cart.quantities[p.id]}</span><span>{won(price(p) * cart.quantities[p.id])}</span></li>)}{cart.recut && <li className="flex justify-between"><span>디자인 변경</span><span>29,000원</span></li>}</ul><p className="mt-4 text-right font-bold">{won(cartTotal)}</p><div className="mt-4 flex flex-wrap gap-4"><button type="button" className="min-h-11 font-semibold underline" onClick={() => setReview(true)}>구매 구성 확인</button><button type="button" className="min-h-11 text-sm text-muted underline" onClick={() => { setCart(null); setReview(false); setMessage("장바구니를 비웠어요."); }}>장바구니 비우기</button></div>{review && <div role="status" className="mt-3 border-t border-line pt-3 text-sm leading-6"><strong>구매 구성 확인 완료</strong><p>현재는 선택·장바구니 체험입니다. 실제 주문과 결제는 진행되지 않습니다. 판매 상품과 결제 연결이 준비되면 이 구성으로 구매할 수 있도록 연결할 예정입니다.</p></div>}</div>}
    <p className="mt-4 text-xs leading-5 text-muted">선택과 장바구니는 이 화면에서만 유지되며, 새로고침하면 초기화됩니다. 실제 주문·결제 기능은 아직 연결되지 않았습니다.</p>
  </section>;
}
