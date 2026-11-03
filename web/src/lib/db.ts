import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Action, State } from "./store";
import type { Garment, MockupSession, Order, OrderStatus, Quote } from "./types";

/**
 * Supabase 연결. 키가 없으면 backendOn이 false라서 지금처럼 이 브라우저에만 저장하는 시연 모드로 돈다.
 * 손님 체험(옷·시안·견적)은 화면 저장소를 그대로 쓰고 바뀔 때마다 서버에 따라 적는다.
 * 주문은 서버(/api/orders)와 데이터베이스 함수가 규칙을 지키며 바꾼다. 규칙은 supabase/schema.sql에 있다.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const BUCKET = "photos";
const DAY = 60 * 60 * 24;

export const backendOn = Boolean(SUPABASE_URL && SUPABASE_KEY);

let customerClient: SupabaseClient | undefined;
let adminClient: SupabaseClient | undefined;
export const customerDb = () => (customerClient ??= createClient(SUPABASE_URL, SUPABASE_KEY));
// 같은 브라우저에서 손님 체험과 관리자 로그인이 서로를 덮어쓰지 않게 저장 키를 나눈다
const adminDb = () => (adminClient ??= createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { storageKey: "reform-admin" } }));

// 행 → 화면 객체 ---------------------------------------------------------

interface GarmentRow {
  id: string;
  photo_path: string | null;
  data: Garment;
}

export interface OrderRow {
  id: string;
  order_no: string;
  user_id: string;
  quote_id: string;
  session_id: string;
  status: OrderStatus;
  total: number;
  customer: Order["customer"];
  tracking: Order["tracking"] | null;
  outbound: Order["outbound"] | null;
  confirm_photo_path: string | null;
  confirm_note: string | null;
  adjust_note: string | null;
  rating: number | null;
  created_at: string;
  order_events: { status: OrderStatus; at: string }[];
}

export const ORDER_COLUMNS = "*, order_events(status, at)";

export function toOrder(r: OrderRow, photos = new Map<string, string>()): Order {
  return {
    id: r.id,
    orderNo: r.order_no,
    quoteId: r.quote_id,
    sessionId: r.session_id,
    userId: r.user_id,
    total: r.total,
    status: r.status,
    history: r.order_events.map((e) => ({ status: e.status, at: Date.parse(e.at) })).sort((a, b) => a.at - b.at),
    customer: r.customer,
    tracking: r.tracking ?? undefined,
    outbound: r.outbound ?? undefined,
    confirmPhoto: r.confirm_photo_path ? photos.get(r.confirm_photo_path) : undefined,
    confirmNote: r.confirm_note ?? undefined,
    adjustNote: r.adjust_note ?? undefined,
    rating: r.rating ?? undefined,
    createdAt: Date.parse(r.created_at),
  };
}

const toGarment = (r: GarmentRow, photos: Map<string, string>): Garment =>
  r.photo_path ? { ...r.data, image: photos.get(r.photo_path) ?? "" } : r.data;

const byId = <T extends { id: string }>(list: T[]) => Object.fromEntries(list.map((x) => [x.id, x]));

/** 비공개 사진을 하루 동안 열리는 주소로 바꾼다 */
async function signPhotos(db: SupabaseClient, paths: (string | null)[]) {
  const list = [...new Set(paths.filter((p): p is string => !!p))];
  if (!list.length) return new Map<string, string>();
  const { data, error } = await db.storage.from(BUCKET).createSignedUrls(list, DAY);
  if (error) throw error;
  return new Map(data.flatMap((d) => (d.path && d.signedUrl ? [[d.path, d.signedUrl] as const] : [])));
}

const check = <T extends { error: unknown }>(res: T) => {
  if (res.error) throw res.error;
  return res;
};

// 손님 -------------------------------------------------------------------

/** 처음 저장할 때 익명 계정을 만든다. 카카오 로그인이 붙으면 이 계정에 이어 붙인다. */
async function customerId() {
  const db = customerDb();
  const { data } = await db.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: signed, error } = await db.auth.signInAnonymously();
  if (error || !signed.user) throw error ?? new Error("익명 로그인에 실패했어요");
  return signed.user.id;
}

/** withPhoto: 사진까지 올린다. 옷 정보만 고칠 때는 사진을 다시 올리지 않는다. */
async function saveGarment(g: Garment, withPhoto = false) {
  const db = customerDb();
  const uid = await customerId();
  const photo = g.source === "upload" ? `${uid}/${g.id}.jpg` : null;
  if (photo && withPhoto && g.image.startsWith("data:")) {
    const blob = await (await fetch(g.image)).blob();
    check(await db.storage.from(BUCKET).upload(photo, blob, { contentType: "image/jpeg", upsert: true }));
  }
  // 사진은 보관함에 두고 표에는 경로만 남긴다
  check(await db.from("garments").upsert({ id: g.id, user_id: uid, photo_path: photo, data: photo ? { ...g, image: "" } : g }));
}

async function saveSession(s: MockupSession) {
  const uid = await customerId();
  check(await customerDb().from("mockup_sessions").upsert({ id: s.id, user_id: uid, garment_id: s.garmentId, data: s }));
}

async function saveQuote(q: Quote) {
  const uid = await customerId();
  check(await customerDb().from("quotes").upsert({ id: q.id, user_id: uid, session_id: q.sessionId, data: q }));
}

let read: () => State = () => ({ garments: {}, sessions: {}, quotes: {}, orders: {}, user: null });
let queue: Promise<void> = Promise.resolve();
const waiting = new Map<string, number>(); // 아직 보내지 않은 시안 id → 타이머

export const connect = (getState: () => State) => {
  read = getState;
};

function enqueue(job: () => Promise<void>) {
  queue = queue.then(job).catch((e) => console.error("서버에 저장하지 못했어요", e));
}

function sendSession(id: string) {
  window.clearTimeout(waiting.get(id));
  waiting.delete(id);
  enqueue(async () => {
    const s = read().sessions[id];
    if (s) await saveSession(s);
  });
}

/** 손님 화면의 변경을 서버에 따라 적는다. 주문은 placeOrder 같은 함수가 따로 맡는다. */
export function mirror(action: Action) {
  switch (action.type) {
    case "garment/add":
      return enqueue(() => saveGarment(action.garment, true));
    case "garment/update":
      return enqueue(async () => {
        const g = read().garments[action.id];
        if (g) await saveGarment(g);
      });
    case "session/add":
      return enqueue(() => saveSession(action.session));
    case "session/update":
      // 위치를 끄는 동안 쏟아지는 변경은 마지막 것만 보낸다
      window.clearTimeout(waiting.get(action.id));
      waiting.set(action.id, window.setTimeout(() => sendSession(action.id), 800));
      return;
    case "quote/add":
      return enqueue(() => saveQuote(action.quote));
  }
}

/** 아직 서버로 보내는 중이라 서버 사본으로 덮으면 안 되는 시안 */
export const pendingSessions = () => new Set(waiting.keys());

/** 이 손님의 서버 기록. 아직 아무것도 저장하지 않은 방문자면 null */
export async function pullMine(): Promise<Omit<State, "user"> | null> {
  const db = customerDb();
  const { data } = await db.auth.getSession();
  if (!data.session) return null;
  const [g, s, q, o] = await Promise.all([
    db.from("garments").select("id, photo_path, data").then(check),
    db.from("mockup_sessions").select("data").then(check),
    db.from("quotes").select("data").then(check),
    db.from("orders").select(ORDER_COLUMNS).then(check),
  ]);
  const garments = g.data as GarmentRow[];
  const orders = o.data as OrderRow[];
  const photos = await signPhotos(db, [...garments.map((r) => r.photo_path), ...orders.map((r) => r.confirm_photo_path)]);
  return {
    garments: byId(garments.map((r) => toGarment(r, photos))),
    sessions: byId((s.data as { data: MockupSession }[]).map((r) => r.data)),
    quotes: byId((q.data as { data: Quote }[]).map((r) => r.data)),
    orders: byId(orders.map((r) => toOrder(r, photos))),
  };
}

let unwatchMine: (() => void) | undefined;

/** 관리자가 주문 상태를 바꾸면 onChange를 부른다 */
export function watchMine(onChange: () => void) {
  if (unwatchMine) return;
  const db = customerDb();
  const channel = db
    .channel("my-orders")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, onChange)
    .subscribe();
  unwatchMine = () => void db.removeChannel(channel);
}

/** 체험 기록 지우기: 이 브라우저의 익명 계정에서 나간다 */
export async function forgetMe() {
  unwatchMine?.();
  unwatchMine = undefined;
  await customerDb().auth.signOut();
}

/** 주문을 만든다. 금액은 서버가 디자인 가격표로 다시 계산한다. */
export async function placeOrder(input: {
  garment: Garment;
  session: MockupSession;
  quote: Quote;
  customer: Order["customer"];
  consents: Record<string, boolean>;
}): Promise<Order> {
  // 밀린 저장을 끝내고, 주문에 쓰는 기록이 서버에 확실히 있게 다시 적는다
  await flush();
  await saveGarment(input.garment, true);
  await saveSession(input.session);
  await saveQuote(input.quote);
  const { data } = await customerDb().auth.getSession();
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify({ quoteId: input.quote.id, customer: input.customer, consents: input.consents }),
  });
  const body = (await res.json().catch(() => ({}))) as { order?: Order; error?: string };
  if (!res.ok || !body.order) throw new Error(body.error ?? "주문을 만들지 못했어요");
  return body.order;
}

async function flush() {
  for (const id of [...waiting.keys()]) sendSession(id);
  await queue;
}

async function call(name: string, args: Record<string, unknown>) {
  const { error } = await customerDb().rpc(name, args);
  if (error) throw new Error(error.message);
}

export const shipOrder = (id: string, carrier: string, number: string) =>
  call("register_shipment", { p_order_id: id, p_carrier: carrier, p_number: number });
export const answerConfirm = (id: string, approve: boolean, note?: string) =>
  call("answer_confirm", { p_order_id: id, p_approve: approve, p_note: note ?? null });
export const rateOrder = (id: string, rating: number) => call("rate_order", { p_order_id: id, p_rating: rating });

// 운영 콘솔 ----------------------------------------------------------------

export async function isAdmin() {
  const db = adminDb();
  const { data } = await db.auth.getSession();
  if (!data.session) return false;
  const { data: ok } = await db.rpc("is_admin");
  return ok === true;
}

export async function adminSignIn(email: string, password: string) {
  const db = adminDb();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw new Error("이메일이나 비밀번호가 맞지 않아요");
  if (!(await isAdmin())) {
    await db.auth.signOut();
    throw new Error("관리자로 등록된 계정이 아니에요");
  }
}

export const adminSignOut = async () => {
  await adminDb().auth.signOut();
};

/** 모든 주문과 그 시안·옷. 화면 저장소와 같은 모양으로 돌려준다. */
export async function pullAll(): Promise<State> {
  const db = adminDb();
  const { data } = check(
    await db
      .from("orders")
      .select(`${ORDER_COLUMNS}, mockup_sessions!session_id(data, garments(id, photo_path, data))`)
      .order("created_at", { ascending: false }),
  );
  const rows = data as (OrderRow & { mockup_sessions: { data: MockupSession; garments: GarmentRow } })[];
  const photos = await signPhotos(db, rows.flatMap((r) => [r.mockup_sessions.garments.photo_path, r.confirm_photo_path]));
  return {
    garments: byId(rows.map((r) => toGarment(r.mockup_sessions.garments, photos))),
    sessions: byId(rows.map((r) => r.mockup_sessions.data)),
    quotes: {},
    orders: byId(rows.map((r) => toOrder(r, photos))),
    user: null,
  };
}

export function watchAll(onChange: () => void) {
  const db = adminDb();
  const channel = db
    .channel("all-orders")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, onChange)
    .subscribe();
  return () => void db.removeChannel(channel);
}

export async function updateOrder(id: string, patch: Record<string, unknown>) {
  const { error } = await adminDb().from("orders").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

/** 입고된 실물 사진을 손님 폴더에 올리고 확정 시안 승인을 요청한다 */
export async function sendConfirm(order: Order, photo: Blob | null, note: string) {
  const patch: Record<string, unknown> = { status: "AWAITING_APPROVAL", confirm_note: note.trim() || null };
  if (photo) {
    const path = `${order.userId}/orders/${order.id}.jpg`;
    check(await adminDb().storage.from(BUCKET).upload(path, photo, { contentType: "image/jpeg", upsert: true }));
    patch.confirm_photo_path = path;
  }
  await updateOrder(order.id, patch);
}
