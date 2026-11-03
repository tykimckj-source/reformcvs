import type { Order, OrderStatus } from "./types";

/** 시안 하나의 주인과 만든 때 */
export interface SessionLog {
  userId: string;
  createdAt: number;
}

const DAY = 86_400_000;
const kstDay = (ts: number) => new Date(ts).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
const ratio = (part: number, whole: number) => (whole ? part / whole : null);
const average = (list: number[]) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null);
const reached = (o: Order, status: OrderStatus) => o.history.some((h) => h.status === status);

/** 운영 콘솔 지표. 결과보고·정산에 쓰는 숫자라 정의를 여기 한곳에 둔다. 비율은 0~1, 자료가 없으면 null */
export function metrics(sessions: SessionLog[], orders: Order[], now: number) {
  const visitors = new Set(sessions.map((s) => s.userId));
  const buyers = new Set(orders.flatMap((o) => (o.userId && visitors.has(o.userId) ? [o.userId] : [])));
  const kept = orders.filter((o) => o.status !== "CANCELLED");
  const approved = orders.filter((o) => reached(o, "IN_PROGRESS"));
  const delivered = orders.flatMap((o) => o.history.filter((h) => h.status === "DELIVERED").map((h) => (h.at - o.createdAt) / DAY));
  const ratings = orders.flatMap((o) => (o.rating ? [o.rating] : []));
  return {
    sessions: sessions.length,
    sessionsToday: sessions.filter((s) => kstDay(s.createdAt) === kstDay(now)).length,
    visitors: visitors.size,
    buyers: buyers.size,
    /** 시안을 만든 손님 중 주문한 손님 */
    conversion: ratio(buyers.size, visitors.size),
    cancelled: orders.length - kept.length,
    /** 취소를 뺀 주문 금액 합계 (실제 결제는 아직 연결 전) */
    revenue: kept.reduce((sum, o) => sum + o.total, 0),
    approved: approved.length,
    /** 확정 시안을 조정 요청 없이 바로 승인한 비율 */
    firstApproval: ratio(approved.filter((o) => !o.adjustNote).length, approved.length),
    delivered: delivered.length,
    /** 주문부터 손님이 받기까지 평균 일수 */
    leadDays: average(delivered),
    ratingCount: ratings.length,
    rating: average(ratings),
  };
}

export type Metrics = ReturnType<typeof metrics>;
