import type { Order, OrderStatus } from "./types";

export const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "AWAITING_SHIPMENT", label: "옷 보내기", desc: "편의점 택배로 작업실에 보내 주세요" },
  { status: "INBOUND_TRANSIT", label: "작업실로 가는 중", desc: "도착하면 알림톡으로 알려 드려요" },
  { status: "INSPECTING", label: "입고·검수", desc: "원단 상태와 치수를 확인해요" },
  { status: "AWAITING_APPROVAL", label: "확정 시안 승인", desc: "실물 위 시안을 보고 승인해 주세요" },
  { status: "IN_PROGRESS", label: "리폼 작업", desc: "작업자가 직접 작업해요" },
  { status: "OUTBOUND_TRANSIT", label: "돌려보내는 중", desc: "송장 번호를 알림톡으로 보내 드려요" },
  { status: "DELIVERED", label: "받으셨어요", desc: "시안과 얼마나 같은지 알려 주세요" },
];

export const STATUS_LABEL = {
  ...Object.fromEntries(ORDER_STEPS.map((s) => [s.status, s.label])),
  CANCELLED: "주문 취소",
} as Record<OrderStatus, string>;

export const stepIndex = (status: OrderStatus) => ORDER_STEPS.findIndex((s) => s.status === status);

// 취소는 진행 단계가 아니라서 다음 단계가 없다
export const nextStatus = (status: OrderStatus): OrderStatus | null =>
  stepIndex(status) < 0 ? null : (ORDER_STEPS[stepIndex(status) + 1]?.status ?? null);

/** 손님이 취소를 요청할 수 있는 상태: 작업을 시작하기 전까지 (DB의 request_cancel과 같다) */
export const CANCELLABLE: OrderStatus[] = ["AWAITING_SHIPMENT", "INBOUND_TRANSIT", "INSPECTING", "AWAITING_APPROVAL"];

export const CARRIERS = ["GS25 반값택배", "CU 알뜰택배", "CJ대한통운", "우체국택배", "롯데택배", "한진택배"];

/** 고객이 옷을 보낼 작업실 주소(예시) */
export const WORKSHOP_ADDRESS = "서울시 성동구 성수이로 00, 리폼 편의점 작업실 (예시 주소)";

export const maskName = (name: string) =>
  name.length <= 1 ? name : name.length === 2 ? `${name[0]}*` : `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;

/** 알림톡을 붙이기 전까지 운영자가 문자나 카카오톡으로 보낼 상태 안내 문구 */
export function contactMessage(order: Pick<Order, "orderNo" | "status" | "customer" | "outbound">, link: string) {
  const say: Record<OrderStatus, string> = {
    AWAITING_SHIPMENT: "주문이 접수됐어요. 편의점 택배로 옷을 작업실에 보내 주시고, 보낸 뒤 송장 번호를 주문 화면에 넣어 주세요. 보낼 주소도 주문 화면에 있어요.",
    INBOUND_TRANSIT: "보내 주신 옷이 작업실로 오고 있어요. 도착하면 검수하고 확정 시안을 보내 드릴게요.",
    INSPECTING: "옷이 작업실에 도착했어요. 원단 상태와 치수를 확인한 뒤 확정 시안을 보내 드릴게요.",
    AWAITING_APPROVAL: "실물 위에 디자인을 맞춘 확정 시안을 올렸어요. 주문 화면에서 확인하시고 '이대로 진행할게요'나 '조정 요청'을 눌러 주세요.",
    IN_PROGRESS: "확정 시안대로 리폼 작업을 시작했어요. 끝나면 송장 번호와 함께 알려 드릴게요.",
    OUTBOUND_TRANSIT: `리폼을 마치고 옷을 보내 드렸어요.${order.outbound ? ` ${order.outbound.carrier} ${order.outbound.number}` : ""}`,
    DELIVERED: "옷은 잘 받으셨나요? 시안과 얼마나 같았는지 주문 화면에서 별점으로 알려 주세요.",
    CANCELLED: "주문이 취소됐어요. 작업실에 도착한 옷이 있으면 돌려보내 드리고, 결제하신 금액은 환불해 드려요.",
  };
  return [
    `[리폼 편의점] ${order.customer.name}님, ${say[order.status]}`,
    `주문번호 ${order.orderNo}`,
    `주문 보기 ${link}`,
    "다른 기기에서 열면 주문번호와 연락처로 찾을 수 있어요.",
  ].join("\n");
}
