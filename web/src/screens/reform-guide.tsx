"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Scissors } from "lucide-react";
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
function MethodCard({ method, suggestion }: { method: Technique; suggestion?: string }) {
  const example = method.example ? examples[method.example] : null;
  return <article className={"rg-card"}><div className={"rg-cardTop"}><span>{method.group}</span><span className={"rg-status"}>{method.status}</span></div><h3>{suggestion || method.name}</h3>{suggestion && <p className={"rg-small"}>방식 · {method.name}</p>}
    <dl><dt>어울리는 옷감</dt><dd>{method.fabric}</dd><dt>먼저 확인해요</dt><dd>{method.limit}</dd></dl>
    {example ? <a className={"rg-example"} href={example.href}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={example.image} alt={example.title} loading="lazy"/><span><strong>{example.title} ↗</strong><small>{method.exampleNote}</small></span>
    </a> : <div className={"rg-placeholder"}>{method.exampleNote}<small>작품 사진이 아직 등록되지 않았어요.</small></div>}
  </article>;
}
export default function ReformGuide() {
  const [garment, setGarment] = useState(""); const [concern, setConcern] = useState(""); const [mood, setMood] = useState("");
  const [group, setGroup] = useState("전체"); const [service, setService] = useState("");
  const ready = garment && concern && mood;
  const cottonStain = garment === garments[0] && concern === concerns[0];
  const availableGroups = groups.filter(g => g !== "니트 고치기");
  const selections = [{ title: "어떤 옷인가요?", name: "garment", options: garments, value: garment, visible: true, change: (v: string) => { setGarment(v); setConcern(""); setMood(""); } }, { title: "무엇을 바꾸고 싶나요?", name: "concern", options: concerns, value: concern, visible: !!garment, change: (v: string) => { setConcern(v); setMood(""); } }, { title: "어떤 느낌이 좋나요?", name: "mood", options: moods, value: mood, visible: !!concern, change: setMood }];
  return <main className={"rg-page"}><div className={"rg-shell"}>
    <header className={"rg-header"}><Link className={"rg-brand"} href="/"><Scissors size={23}/>리폼 편의점</Link><a href="#methods">기법 둘러보기 <ArrowUpRight size={15}/></a></header>
    <section className={"rg-hero"}><div><span className={"rg-eyebrow"}>옷의 다음 이야기를 함께</span><h1>버리기 전에,<br/>한 번 더 <span>나답게.</span></h1><p>내 옷에 뭘 할 수 있을까?<br/>옷과 고민을 고르면, 어울리는 리폼 방법부터 알려드려요.</p><a className={"rg-primary"} href="#finder">내 옷에 가능한 리폼 보기 <ArrowDown size={18}/></a><small>지금은 방법을 탐색하는 미리보기예요. 접수·결제는 열려 있지 않아요.</small></div><div className={"rg-heroWork"}><div className={"rg-sectionLine"}><span>한 벌의 옷, 새로운 표정</span><span>01 / PK티</span></div><RealCaseCompare/><p className={"rg-note"}>실제 작품을 바탕으로 정리한 비교 이미지입니다. AI 평면화·색감 보정이 포함되어 있으며 실측·원본 촬영 그대로의 비교는 아닙니다.</p></div></section>
    <section id="finder" className={"rg-section"}><span className={"rg-eyebrow"}>FIND YOUR REFORM</span><h2>내 옷에서 시작해 볼까요?</h2><p className={"rg-intro"}>이번에는 흰 반팔 티부터. 고민과 느낌을 고르면 두 가지 방법까지만 제안해요.</p><div className={"rg-finderGrid"}><div className={"rg-steps"}>
      {selections.filter(s => s.visible).map((s, index) => <fieldset key={s.name}><legend><span>0{index + 1}</span> {s.title}</legend><div className={"rg-choices"}>{s.options.map(v => <label key={v}><input type="radio" name={s.name} checked={s.value === v} onChange={() => s.change(v)}/><span>{v}</span></label>)}</div>{s.name === "garment" && <small>흰 반팔 티는 면 소재 기준이에요. 혼방·기능성 원단은 추가 확인이 필요해요.</small>}</fieldset>)}
      {garment && <button className={"rg-reset"} onClick={() => { setGarment(""); setConcern(""); setMood(""); }}>처음부터 다시 고르기</button>}
    </div><div className={"rg-results"} aria-live="polite" aria-atomic="true">{!ready ? <div className={"rg-empty"}><Scissors size={32}/><h3>어떤 변화가 어울릴까요?</h3><p>{!garment ? "먼저 옷을 골라주세요." : !concern ? "바꾸고 싶은 부분을 골라주세요." : "마지막으로 원하는 느낌을 골라주세요."}</p><span>선택한 내용에 맞춰 여기에 추천이 나타나요.</span></div> : <><p className={"rg-summary"}>{garment} / {concern} / {mood}</p><h3 className={"rg-resultTitle"}>이 방법부터 살펴보세요</h3><p className={"rg-note"}>{cottonStain ? "작은 얼룩을 가정한 추천 예시예요. 얼룩 위치에 맞춰 무늬를 놓되, 얼룩이 비치거나 열에 약한 원단이면 확인이 필요해요." : "옷감과 손상 범위를 확인하기 전의 방법 제안이에요. 실제 작업 가능 여부는 확인이 필요해요."}{mood === "티 안 나게" && " 완전히 흔적 없이 가려지거나 복원된다는 뜻은 아니에요."}</p><div className={"rg-resultCards"}>{recommend(garment, concern, mood).map(method => <MethodCard key={method.id} method={method} suggestion={cottonStain ? method.id === "stamp" ? "얼룩 위치에 작은 물고기 스탬프" : "얼룩 크기에 맞춘 작은 전사지" : undefined}/>)}</div><p className={"rg-small"}>추천 문구는 예시 규칙입니다. 실제 작업 범위와 제공 상태는 운영 확정 전이에요.</p></>}</div></div></section>
    <section id="methods" className={"rg-section"}><span className={"rg-eyebrow"}>작은 변화의 여러 방법</span><h2>어떻게 바꿀 수 있을까요?</h2><p className={"rg-intro"}>기법마다 어울리는 옷감이 달라요. 작품과 적용 조건을 함께 살펴보세요.</p><div className={"rg-filters"} aria-label="기법 분류">{["전체", ...availableGroups].map(v => <button key={v} aria-pressed={group === v} onClick={() => setGroup(v)}>{v}</button>)}</div><p className={"rg-small"}>가능: 운영 제공 확정 · 확인 필요: 옷감·손상 확인 후 판단 · 준비 중: 아직 제공하지 않음<br/>이번 미리보기에서는 제공이 확정되지 않아 ‘가능’으로 표시한 기법이 없습니다.</p><div className={"rg-methodGrid"}>{techniques.filter(t => t.group !== "니트 고치기" && (group === "전체" || t.group === group)).map(method => <MethodCard key={method.id} method={method}/>)}</div></section>
    <section id="works" className={"rg-section"}><span className={"rg-eyebrow"}>옷에 남은 실제 이야기</span><h2>이미 만들어 본 변화들</h2><p className={"rg-intro"}>기존 작품과 앞뒤 비교를 이어서 볼 수 있어요. 사진에는 AI 평면화·재현·보정이 포함되어 있습니다.</p><div className={"rg-workGrid"}>{works.map(([slug, title, image]) => <Link href={`/cases/${slug}`} key={slug}>{image && <Image src={image} alt={title} width={640} height={640} unoptimized/>}<span>{title}<ArrowUpRight size={18}/></span><small>작품 바탕 비교 이미지 · 전후 비교 보기</small></Link>)}</div><details className={"rg-back"}><summary>첫 파란 PK티의 뒷면도 비교하기</summary><div><RealCaseCompare side="back"/></div></details></section>
    <section className={"rg-section"}><span className={"rg-eyebrow"}>나에게 편한 방식으로</span><h2>직접 해볼까, 맡겨볼까?</h2><div className={"rg-services"}>{["직접 해보기", "맡겨서 바꾸기"].map(v => <button key={v} aria-pressed={service === v} onClick={() => setService(v)}><span className={"rg-status"}>준비 중</span><h3>{v}</h3><p>{v === "직접 해보기" ? "재료와 방법을 골라 내 손으로 바꾸는 방식" : "옷을 확인한 뒤 작업자와 방법을 정하는 방식"}</p><span>준비 상황 보기 →</span></button>)}</div><div className={"rg-serviceNote"} role="status">{service ? `${service}는 아직 준비 중입니다. ${service === "직접 해보기" ? "재료 구성·설명서·판매 방식을 정하고 있어요." : "상담·가격·작업 범위·접수 방법을 정하고 있어요."} 지금은 신청하거나 결제할 수 없습니다.` : "방식을 선택하면 준비 상황을 볼 수 있어요. 주문이나 접수는 진행되지 않습니다."}</div></section>
    <footer>리폼 편의점 · 옷의 가능성을 다시 발견하는 곳<p>미리보기 전용 — 고객 사진 AI 합성·주문·결제·택배 접수 미운영</p></footer>
  </div></main>;
}
