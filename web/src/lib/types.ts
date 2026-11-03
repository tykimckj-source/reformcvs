export type Category = "jacket" | "shirt" | "tshirt" | "hoodie" | "pants";
export type Material = "denim" | "cotton" | "knit" | "poly" | "leather";
export type DesignType = "embroidery" | "wappen" | "patch" | "print";
export type PlacementId =
  | "left-chest"
  | "right-chest"
  | "center-chest"
  | "sleeve"
  | "hem"
  | "thigh"
  | "knee";

export type Point = { x: number; y: number };

export interface QualityReport {
  brightness: number;
  sharpness: number;
  coverage: number;
  issues: string[];
}

export interface Garment {
  id: string;
  source: "sample" | "upload";
  sampleId?: string;
  name: string;
  image: string;
  width: number;
  height: number;
  category: Category;
  colorName: string;
  colorHex: string;
  material: Material | null;
  anchors: Partial<Record<PlacementId, Point>>;
  /** 이미지 너비 대비 1cm가 차지하는 비율(%). 실측은 입고 검수에서 다시 맞춘다. */
  pctPerCm: number;
  analyzed: boolean;
  quality?: QualityReport;
  createdAt: number;
}

export interface MockupOptions {
  placement: PlacementId;
  pos: Point;
  sizeCm: number;
  colorId: string;
  text: string;
}

export interface MockupSession {
  id: string;
  garmentId: string;
  designSlug: string;
  options: MockupOptions;
  feedback: Record<string, "up" | "down">;
  manualRequested?: boolean;
  createdAt: number;
}

export interface PriceLine {
  label: string;
  amount: number;
}

export interface Quote {
  id: string;
  sessionId: string;
  lines: PriceLine[];
  total: number;
  leadDays: number;
  createdAt: number;
}

export type OrderStatus =
  | "AWAITING_SHIPMENT"
  | "INBOUND_TRANSIT"
  | "INSPECTING"
  | "AWAITING_APPROVAL"
  | "IN_PROGRESS"
  | "OUTBOUND_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: string;
  orderNo: string;
  quoteId: string;
  sessionId: string;
  total: number;
  status: OrderStatus;
  history: { status: OrderStatus | "PAID"; at: number }[];
  tracking?: { carrier: string; number: string };
  /** 작업이 끝나 돌려보낸 택배 */
  outbound?: { carrier: string; number: string };
  customer: { name: string; phone: string; address: string };
  /** 입고 후 운영자가 올린 실물 사진(열람 주소)과 메모 */
  confirmPhoto?: string;
  confirmNote?: string;
  adjustNote?: string;
  rating?: number;
  /** 입고 검수 실측 (cm) */
  measurements?: { chest?: number; anchor?: number };
  /** 손님이 취소를 요청한 때와 사유. 반송·환불은 운영자가 처리하고 상태를 CANCELLED로 바꾼다 */
  cancelRequestedAt?: number;
  cancelReason?: string;
  /** 서버 주문의 주인. 운영 콘솔이 사진을 손님 폴더에 올릴 때 쓴다 */
  userId?: string;
  createdAt: number;
}
