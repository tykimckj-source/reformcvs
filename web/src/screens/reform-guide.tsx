"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Scissors, Droplets, CircleDashed, Sparkles, Shirt, ArrowLeft, Check } from "lucide-react";
import { RealCaseCompare } from "@/components/real-case-compare";
import { concerns, examples, garments, groups, moods, recommend, techniques, type Technique } from "@/lib/reform-guide";
import "./reform-guide.css";

const works = [
  ["knit-yarn", "보풀난 니트, 털실로 새 표정", "/cases/knit-yarn/after-long.png"],
  ["white-stamp", "흰 남방에 나비와 꽃", "/cases/white-stamp/after-front.png"],
  ["gray-recut", "소매를 다시 재단한 회색 티", ""],
  ["denim-skirt", "바지 두 벌이 한 벌의 치마로", ""],
  ["indigo-ocean", "이염 위에 쪽빛 바다", "/cases/indigo-ocean/after-front.png"],
  ["black-wide", "블랙 팬츠에 더한 여유", ""],
  ["transfer-sweatshirt", "작은 전사지로 더한 그림", "/cases/transfer-sweatshirt/after-front.png"],
  ["blue-zipper", "파란 PK티, 지퍼로 새롭게", "/cases/blue-zipper/after-front-color-unified.png"],
  ["blue-eye", "파란 PK티에 담은 작은 시선들", "/cases/blue-eye/after-front-matched-unified.png"],
  ["blue-crop", "가볍게 걸치는 크롭 조끼", "/cases/blue-crop/after-front-unified.png"],
];
const quickCopy: Record<string, string> = {
  stamp: "작은 무늬를 찍어 얼룩 자리에도 포인트를 줘요.",
  transfer: "원하는 그림을 열로 붙여 분위기를 바꿔요.",
  patch: "원단을 덧대어 손상된 부분을 보강해요.",
  embroidery: "실로 작은 그림이나 이니셜을 더해요.",
};
function MethodCard({ method, suggestion }: { method: Technique; suggestion?: string }) {
  const example = method.example ? examples[method.example] : null;
  return <article className="rg-card">
    <div className="rg-cardTop"><span>{method.group}</span><span className="rg-status">{method.status}</span></div>
    <h3>{suggestion || method.name}</h3>
    <p className="rg-oneLine">{quickCopy[method.id] || method.fabric}</p>
    {example && <a className="rg-example" href={example.href}>
      <Image src={example.image} alt={example.title} width={120} height={140} unoptimized/>
      <span><strong>관련 작품 보기 <ArrowUpRight size={14}/></strong><small>{example.title}</small></span>
    </a>}
    <details className="rg-cardDetails"><summary>옷감·제한·작품 안내</summary>
      <dl><dt>어울리는 옷감</dt><dd>{method.fabric}</dd><dt>확인할 조건</dt><dd>{method.limit}</dd><dt>작품 안내</dt><dd>{method.exampleNote}{!example && " · 사진 준비 중"}</dd></dl>
    </details>
  </article>;
}
export default function ReformGuide() {
  const [concern, setConcern] = useState("");
  const [mood, setMood] = useState("");
  const [step, setStep] = useState(0);
  const [group, setGroup] = useState<string>(groups[0]);
  const [service, setService] = useState("");
  const [allWorks, setAllWorks] = useState(false);
  const icons = [Droplets, CircleDashed, Sparkles];
  const hints = ["눈에 띄는 얼룩을 가리고 싶어요", "작게 뜯어진 곳을 보강하고 싶어요", "밋밋한 티에 새 표정을 주고 싶어요"];
  const move = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => {
      document.getElementById("rg-step-title")?.focus({ preventScroll: true });
      document.getElementById("finder")?.scrollIntoView({ block: "start" });
    });
  };
  return <main className="rg-page"><div className="rg-shell">
    <header className="rg-header"><Link className="rg-brand" href="/reform-guide"><Scissors size={23}/>리폼 편의점</Link><nav><a href="#finder">리폼 찾기</a><a href="#works">작품 보기</a></nav></header>
    <section className="rg-hero"><div><span className="rg-eyebrow">흰 티 한 장의 새로운 시작</span><h1>버리기 전에,<br/>한 번 더 <span>나답게.</span></h1><p>얼룩이 생겼나요, 조금 심심해졌나요?<br/>두 번 고르면 내 옷에 맞는 방법이 보여요.</p><a className="rg-primary" href="#finder">내 옷에 가능한 리폼 보기 <ArrowDown size={18}/></a><small>흰 면 반팔 티부터 · 상담·주문은 준비 중</small></div><div className="rg-heroWork"><div className="rg-sectionLine"><span>막대를 움직여 변화를 보세요</span><span>작품 사례 · PK티</span></div><RealCaseCompare/><small className="rg-imageNote">실제 작품 기반 · AI 평면화·색감 보정 포함</small></div></section>
    <section id="finder" className="rg-section rg-finder">
      <div className="rg-finderTop"><span className="rg-garment"><Shirt size={20}/> 흰 반팔 티 <small>면 소재 기준</small></span><span className="rg-count">{step < 2 ? `${step + 1} / 2 선택` : "선택 완료"}</span></div>
      <ol className="rg-progress" aria-label="리폼 찾기 순서">{["고민 고르기", "느낌 고르기", "추천 보기"].map((v,i)=><li key={v} aria-current={step === i ? "step" : undefined} data-done={step > i}>{step > i ? <Check size={15}/> : <span>{i+1}</span>}{v}</li>)}</ol>
      <h2 id="rg-step-title" tabIndex={-1}>{step === 0 ? "흰 티, 무엇을 바꾸고 싶나요?" : step === 1 ? "어떤 느낌으로 바꿔볼까요?" : "이 방법부터 살펴보세요"}</h2>
      <p className="rg-intro">{step === 0 ? "가장 가까운 고민 하나만 골라주세요." : step === 1 ? `선택한 고민: ${concern}` : `${concern} · ${mood}`}</p>
      {step === 0 && <div className="rg-choiceTiles">{concerns.map((v,i)=>{const Icon=icons[i];return <button key={v} aria-pressed={concern===v} onClick={()=>{setConcern(v);setMood("");move(1);}}><Icon size={30}/><strong>{v}</strong><span>{hints[i]}</span><b>이 고민 선택 →</b></button>;})}</div>}
      {step === 1 && <><div className="rg-choiceTiles rg-two">{moods.map((v,i)=><button key={v} onClick={()=>{setMood(v);move(2);}}>{i===0 ? <CircleDashed size={30}/> : <Sparkles size={30}/>}<strong>{v}</strong><span>{i===0 ? "작고 차분한 변화가 좋아요" : "그림과 색이 보여도 좋아요"}</span><b>추천 방법 보기 →</b></button>)}</div><button className="rg-reset" onClick={()=>move(0)}><ArrowLeft size={15}/> 고민 다시 고르기</button></>}
      {step === 2 && <><div className="rg-resultCards rg-resultPair">{recommend(garments[0],concern,mood).map(method=><MethodCard key={method.id} method={method} suggestion={concern===concerns[0] ? method.id==="stamp" ? "작은 물고기 스탬프" : "작은 그림 전사지" : undefined}/>)}</div><div className="rg-condition"><strong>확인 필요</strong><span>{concern===concerns[0] ? "작은 얼룩을 가정한 제안이에요. 얼룩 비침·원단의 열 적합성을 먼저 확인해요." : "옷감과 손상 범위를 확인한 뒤 작업 방법을 정해요."}{mood===moods[0] && " 흔적 없는 복원을 보장하지 않아요."}</span></div><div className="rg-resultActions"><button className="rg-reset" onClick={()=>move(1)}><ArrowLeft size={15}/> 느낌 바꾸기</button><button className="rg-reset" onClick={()=>{setConcern("");setMood("");move(0);}}>다른 고민 고르기</button><a href="#service">이용 방식 알아보기 →</a></div></>}
      <p className="rg-small">혼방·기능성 원단은 별도 확인이 필요해요. 추천은 방법 안내이며 작업 확정이 아닙니다.</p>
    </section>
    <section id="works" className="rg-section"><span className="rg-eyebrow">작품으로 보는 변화</span><h2>이렇게 다시 입고 있어요</h2><p className="rg-intro">작품을 누르면 전후를 비교할 수 있어요.</p><div className="rg-workGrid">{(allWorks ? works : works.filter(w=>["white-stamp","indigo-ocean","transfer-sweatshirt"].includes(w[0]))).map(([slug,title,image])=><Link href={`/cases/${slug}`} key={slug}>{image && <Image src={image} alt={title} width={640} height={640} unoptimized/>}<span>{title}<ArrowUpRight size={18}/></span><small>전후 비교 보기</small></Link>)}</div><button className="rg-more" onClick={()=>setAllWorks(!allWorks)}>{allWorks ? "대표 작품만 보기" : "기존 작품 모두 보기"}</button><small className="rg-imageNote">작품 사진에는 AI 평면화·재현·보정이 포함되어 있습니다.</small><details className="rg-back"><summary>파란 PK티 뒷면 비교</summary><div><RealCaseCompare side="back"/></div></details></section>
    <section id="methods" className="rg-section"><span className="rg-eyebrow">기법이 궁금하다면</span><h2>리폼 방법 둘러보기</h2><div className="rg-filters" aria-label="기법 분류">{groups.filter(g=>g!=="니트 고치기").map(v=><button key={v} aria-pressed={group===v} onClick={()=>setGroup(v)}>{v}</button>)}</div><div className="rg-methodGrid">{techniques.filter(t=>t.group===group).map(method=><MethodCard key={method.id} method={method}/>)}</div><p className="rg-small">확인 필요: 옷 상태 확인 후 판단 · 준비 중: 아직 제공하지 않음</p></section>
    <section id="service" className="rg-section"><span className="rg-eyebrow">나에게 편한 방식으로</span><h2>직접 해볼까, 맡겨볼까?</h2><div className="rg-services">{["직접 해보기","맡겨서 바꾸기"].map(v=><button key={v} aria-pressed={service===v} onClick={()=>setService(v)}><span className="rg-status">준비 중</span><h3>{v}</h3><p>{v==="직접 해보기" ? "재료와 설명을 보고 내 손으로" : "작업자와 상담해 내 옷에 맞게"}</p><span>준비 상황 보기 →</span></button>)}</div><div className="rg-serviceNote" role="status">{service ? `${service}는 준비 중이에요. 가격·구성·접수 방법은 정해지는 대로 안내할게요. 지금은 신청·결제가 되지 않습니다.` : "두 방식 모두 준비 중이며, 아직 주문·접수는 받지 않아요."}</div></section>
    <footer>리폼 편의점 · 옷의 가능성을 다시 발견하는 곳<p>미리보기 전용 · AI 합성·주문·결제·택배 접수 미운영</p></footer>
  </div></main>;
}
