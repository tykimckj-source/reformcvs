import { createClient } from "@supabase/supabase-js";
import { ORDER_COLUMNS, toOrder, type OrderRow } from "@/lib/db";
import { designBySlug, priceLines, sumLines } from "@/lib/designs";
import { newId } from "@/lib/format";
import type { MockupSession } from "@/lib/types";

const fail = (status: number, error: string) => Response.json({ error }, { status });

/** 이름·연락처·주소를 다듬는다. 형식이 맞지 않으면 null */
function cleanCustomer(input: unknown) {
  const c = (input ?? {}) as Record<string, unknown>;
  const name = String(c.name ?? "").trim();
  const phone = String(c.phone ?? "").trim();
  const address = String(c.address ?? "").trim();
  const digits = phone.replace(/\D/g, "").length;
  if (!name || name.length > 30 || digits < 9 || digits > 12 || address.length < 5 || address.length > 200) return null;
  return { name, phone, address };
}

/** 주문번호: R + 한국 날짜(yymmdd) + 네 자리 */
const orderNo = () =>
  `R${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "2-digit", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replaceAll("-", "")}${Math.floor(1000 + Math.random() * 9000)}`;

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return fail(503, "주문 서버가 아직 준비되지 않았어요");
  // 비밀 키는 접근 규칙을 건너뛰므로, 주문한 사람과 견적·시안의 주인이 같은지 아래에서 직접 맞춰 본다
  const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const user = token ? (await db.auth.getUser(token)).data.user : null;
  if (!user) return fail(401, "다시 들어와서 주문해 주세요");

  const body = (await request.json().catch(() => null)) as {
    quoteId?: unknown;
    customer?: unknown;
    consents?: Record<string, unknown>;
  } | null;
  const customer = cleanCustomer(body?.customer);
  if (!customer) return fail(400, "이름·연락처·주소를 확인해 주세요");
  if (body?.consents?.custom !== true || body.consents.ai !== true) return fail(400, "필수 약관에 동의해 주세요");

  const { data: quote } = await db
    .from("quotes")
    .select("id, session_id, mockup_sessions!session_id(user_id, data)")
    .eq("id", String(body.quoteId ?? ""))
    .eq("user_id", user.id)
    .maybeSingle();
  const session = quote?.mockup_sessions as unknown as { user_id: string; data: MockupSession } | null;
  const design = session ? designBySlug(session.data.designSlug) : undefined;
  if (!quote || !session || session.user_id !== user.id || !design) return fail(404, "시안 기록을 찾지 못했어요. 다시 시도해 주세요");

  // 화면이 보낸 금액은 믿지 않고 디자인 가격표로 다시 계산한다
  const total = sumLines(priceLines(design, session.data.options));
  const consents = { custom: true, ai: true, learn: body.consents.learn === true, at: new Date().toISOString() };

  for (let tries = 0; tries < 5; tries++) {
    const id = newId("o");
    const { error } = await db
      .from("orders")
      .insert({ id, order_no: orderNo(), user_id: user.id, quote_id: quote.id, session_id: quote.session_id, total, customer, consents });
    if (error?.code === "23505") continue; // 주문번호가 겹치면 다시 뽑는다
    if (error) return fail(500, "주문을 저장하지 못했어요");
    // 상태 기록은 트리거가 저장 뒤에 남기므로 다시 읽어서 함께 돌려준다
    const { data } = await db.from("orders").select(ORDER_COLUMNS).eq("id", id).single();
    if (!data) return fail(500, "주문은 접수됐지만 불러오지 못했어요. 새로고침해 주세요");
    return Response.json({ order: toOrder(data as OrderRow) });
  }
  return fail(500, "주문번호를 만들지 못했어요");
}
