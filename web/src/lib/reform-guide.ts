// Edit customer-facing copy, availability and example photos here.
// Availability is provisional: do not mark a service available before operator confirmation.
export type Availability = "가능" | "확인 필요" | "준비 중";
export const groups = ["바늘로 더하기", "붙여 더하기", "찍고 그리기", "금속 포인트", "니트 고치기"] as const;
export const examples = {
  stamp: { title: "나비·꽃 스탬프와 스텐실 남방", image: "/cases/white-stamp/after-front.png", href: "/cases/white-stamp" },
  transfer: { title: "작은 그림을 더한 맨투맨", image: "/cases/transfer-sweatshirt/after-front.png", href: "/cases/transfer-sweatshirt" },
  knit: { title: "털실로 표정을 더한 니트", image: "/cases/knit-yarn/after-long.png", href: "/cases/knit-yarn" },
  patch: { title: "원단 패치와 쪽빛 티셔츠", image: "/cases/indigo-ocean/after-front.png", href: "/cases/indigo-ocean" },
  rivet: { title: "리벳과 페인팅을 더한 PK티", image: "/cases/blue-polo-rivets-hd-unified.png", href: "#works" },
};
export type Technique = { id: string; group: typeof groups[number]; name: string; fabric: string; limit: string; status: Availability; example?: keyof typeof examples; exampleNote: string };
export const techniques: Technique[] = [
  { id: "embroidery", group: groups[0], name: "이니셜·그림 자수", fabric: "짜임이 안정적인 면·린넨 등", limit: "얇거나 잘 늘어나는 원단은 울거나 당길 수 있어 보강 여부 확인", status: "확인 필요", exampleNote: "해당 기법의 확인된 작품 사진 준비 중" },
  { id: "badge", group: groups[1], name: "와펜", fabric: "두께가 있는 면·데님 등", limit: "두께·무게와 부착 방식을 확인해요. 열접착 와펜은 열 적합성 확인", status: "확인 필요", exampleNote: "와펜 단독 작품 사진 준비 중" },
  { id: "patch", group: groups[1], name: "원단 패치", fabric: "면·데님, 보강 가능한 니트", limit: "본체와 패치의 신축성·두께가 맞아야 해요. 구멍은 먼저 손상 범위 확인", status: "확인 필요", example: "patch", exampleNote: "쪽염색·원단 패치 복합 사례 / 사진 정리 이미지" },
  { id: "transfer", group: groups[1], name: "열전사지", fabric: "전사지 규격에 맞는 면·혼방", limit: "열에 약한 원단·코팅 원단은 확인 필요. 얼룩이 비칠 수 있어요", status: "확인 필요", example: "transfer", exampleNote: "맨투맨 전사지 사례 / AI 평면화 이미지, 반팔 적용 예시 아님" },
  { id: "stamp", group: groups[2], name: "스탬프", fabric: "표면이 비교적 평평한 면·린넨", limit: "성긴 짜임은 무늬가 끊길 수 있고, 얼룩이 비칠 수 있어요. 안료·고착 조건 확인", status: "확인 필요", example: "stamp", exampleNote: "나비·꽃 복합 사례 / 사진 정리 이미지, 물고기 작업 사진 아님" },
  { id: "stencil", group: groups[2], name: "스텐실", fabric: "표면이 고른 면·데님 등", limit: "원단 요철·신축성에 따라 번짐과 갈라짐 확인. 얼룩 은폐를 보장하지 않아요", status: "확인 필요", example: "stamp", exampleNote: "스탬프·스텐실 복합 사례 / 사진 정리 이미지" },
  { id: "silkscreen", group: groups[2], name: "실크스크린", fabric: "잉크·고착 조건에 맞는 원단", limit: "판 제작, 수량과 원단별 시험 필요. 제공 범위 미확정", status: "준비 중", exampleNote: "확인된 작품 사진 준비 중" },
  { id: "metal", group: groups[3], name: "리벳·아일렛", fabric: "보강 가능한 두께 있는 원단", limit: "얇은 원단·성긴 니트는 찢어지거나 처질 수 있어요. 구멍 가공·피부 접촉 확인", status: "확인 필요", example: "rivet", exampleNote: "리벳 복합 사례 / AI 평면화·보정 이미지, 아일렛 사례는 준비 중" },
  { id: "needle", group: groups[4], name: "바늘로 코 잇기·수선", fabric: "손상 범위를 확인한 니트", limit: "색·실·짜임과 풀림에 따라 달라져요. 사진이나 실물 확인 전 수선 확정 불가", status: "확인 필요", example: "knit", exampleNote: "털실 장식 참고 사례 / AI 평면화 이미지, 구멍 수선 실적은 아님" },
  { id: "crochet", group: groups[4], name: "코바늘 수선·장식", fabric: "보강이 가능한 니트", limit: "실 무게·짜임·손상 범위 확인 필요. 원래 짜임과 똑같이 복원되는 것은 아니에요", status: "확인 필요", example: "knit", exampleNote: "털실 장식 참고 사례 / AI 평면화 이미지, 구멍 수선 실적은 아님" },
  { id: "felting", group: groups[4], name: "니들펠팅", fabric: "펠팅에 적합한 울 계열 중심", limit: "모든 니트에 가능하지 않아요. 섬유 조성·두께·바늘 손상 시험 필요", status: "준비 중", exampleNote: "확인된 작품 사진 준비 중" },
];
export const garments = ["흰 반팔 티"] as const;
export const concerns = ["얼룩·이염 가리기", "작은 구멍 수선", "포인트 더하기"] as const;
export const moods = ["티 안 나게", "무늬나 색으로 살리기"] as const;
export function recommend(garment: string, concern: string, mood: string) {
  let ids: string[];
  if (garment === "니트") ids = concern === "작은 구멍 수선" ? (mood === "티 안 나게" ? ["needle"] : ["needle", "crochet"]) : (mood === "티 안 나게" ? ["needle"] : ["crochet", "patch"]);
  else ids = concern === "작은 구멍 수선" ? (mood === "티 안 나게" ? ["patch"] : ["patch", "embroidery"]) : concern === "얼룩·이염 가리기" ? ["stamp", "transfer"] : (mood === "티 안 나게" ? ["embroidery", "transfer"] : ["stamp", "patch"]);
  return ids.map(id => techniques.find(t => t.id === id)!);
}
