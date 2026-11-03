// 손님 연락 문구 검사: node src/lib/orders.check.mjs
import assert from "node:assert/strict";
import { contactMessage, ORDER_STEPS } from "./orders.ts";

const order = { orderNo: "R2611031234", customer: { name: "김리폼" } };
for (const { status } of ORDER_STEPS) {
  const text = contactMessage({ ...order, status }, "https://x.test/orders/o_1");
  assert.ok(text.startsWith("[리폼 편의점] 김리폼님, "), status);
  assert.ok(text.includes("주문번호 R2611031234") && text.includes("https://x.test/orders/o_1"), status);
  assert.doesNotMatch(text, /undefined|null/, `${status}: 빈 값이 그대로 찍히지 않는다`);
}
const shipped = contactMessage({ ...order, status: "OUTBOUND_TRANSIT", outbound: { carrier: "CJ대한통운", number: "987654321098" } }, "l");
assert.ok(shipped.includes("CJ대한통운 987654321098"), "출고 문구에 송장이 들어간다");

console.log("손님 연락 문구 검사 통과");
