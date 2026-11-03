// 운영 지표 계산 검사: node src/lib/metrics.check.mjs
import assert from "node:assert/strict";
import { metrics } from "./metrics.ts";

const H = 3_600_000;
const NOW = Date.parse("2026-11-03T05:00:00Z"); // 한국 시각 11/3 14시
const session = (userId, hoursAgo) => ({ userId, createdAt: NOW - hoursAgo * H });
const order = (userId, status, extra = {}) => ({
  userId,
  status,
  total: 28500,
  createdAt: NOW - 72 * H,
  ...extra,
  history: [{ status: "AWAITING_SHIPMENT", at: NOW - 72 * H }, ...(extra.history ?? [])],
});

const m = metrics(
  // a는 오늘 두 번, b는 어제(한국 시각 11/2 13시), c는 오늘 한 번 시안을 만들었다
  [session("a", 1), session("a", 2), session("b", 25), session("c", 3)],
  [
    order("a", "DELIVERED", { rating: 4, history: [{ status: "IN_PROGRESS", at: NOW - 48 * H }, { status: "DELIVERED", at: NOW }] }),
    order("b", "IN_PROGRESS", { adjustNote: "조금 위로", history: [{ status: "IN_PROGRESS", at: NOW - 10 * H }] }),
    order("b", "CANCELLED", { total: 30000 }),
  ],
  NOW,
);
assert.equal(m.sessions, 4);
assert.equal(m.sessionsToday, 3, "오늘은 한국 날짜로 센다");
assert.equal(m.visitors, 3);
assert.equal(m.buyers, 2, "주문 두 건을 한 손님(b)은 한 명으로 센다");
assert.equal(m.conversion, 2 / 3);
assert.equal(m.cancelled, 1);
assert.equal(m.revenue, 57000, "취소한 주문 금액은 뺀다");
assert.equal(m.approved, 2);
assert.equal(m.firstApproval, 0.5, "조정 요청이 있었던 주문은 한 번에 승인한 것이 아니다");
assert.equal(m.delivered, 1);
assert.equal(m.leadDays, 3, "주문부터 도착까지 72시간");
assert.equal(m.rating, 4);
assert.equal(m.ratingCount, 1);

const empty = metrics([], [], NOW);
assert.deepEqual([empty.conversion, empty.firstApproval, empty.leadDays, empty.rating], [null, null, null, null], "자료가 없으면 비율 대신 null");

console.log("운영 지표 계산 검사 통과");
