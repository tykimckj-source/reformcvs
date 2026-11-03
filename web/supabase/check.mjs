// Supabase 없이 schema.sql의 접근 규칙과 상태 함수를 검사한다: npm run db:check
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

// Supabase가 미리 만들어 두는 역할·함수·테이블을 흉내 낸다
const SUPABASE_STUB = `
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable
  as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create schema storage;
create table storage.buckets (id text primary key, name text not null, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets, name text not null);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable
  as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
create publication supabase_realtime;
grant usage on schema public, auth, storage to anon, authenticated;
grant all on storage.objects to authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
`;

const db = new PGlite();
await db.exec(SUPABASE_STUB);
await db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));

const [A, B, ADMIN] = ["a", "b", "c"].map((c) => `${c.repeat(8)}-0000-4000-8000-000000000000`);
for (const id of [A, B, ADMIN]) await db.query("insert into auth.users (id) values ($1)", [id]);
await db.query("insert into public.admins (user_id) values ($1)", [ADMIN]);

/** uid로 로그인한 사람처럼 실행한다. uid가 null이면 서버(비밀 키)처럼 규칙 없이 실행한다. */
async function as(uid, sql, params = []) {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ""]);
  if (uid) await db.exec("set role authenticated");
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec("reset role");
  }
}
const fails = (uid, sql, params, label) => assert.rejects(() => as(uid, sql, params), label);
const rows = async (uid, sql) => (await as(uid, sql)).rows;
const status = async () => (await rows(null, "select status from public.orders where id = 'o1'"))[0].status;
const NEW_ORDER = `insert into public.orders (id, order_no, user_id, quote_id, session_id, total, customer, consents)
                   values ($1, $1, $2, 'q1', 's1', 28500, '{}', '{}')`;

// 손님 A의 체험 기록은 A와 관리자만 본다
await as(A, "insert into public.garments (id, data) values ('g1', '{}')");
await as(A, "insert into public.mockup_sessions (id, garment_id, data) values ('s1', 'g1', '{}')");
await as(A, "insert into public.quotes (id, session_id, data) values ('q1', 's1', '{}')");
assert.equal((await rows(A, "select id from public.garments")).length, 1, "A는 자기 옷을 본다");
assert.equal((await rows(B, "select id from public.garments")).length, 0, "B는 A의 옷을 못 본다");
assert.equal((await as(B, `update public.garments set data = '{"x":1}'`)).affectedRows, 0, "B는 A의 옷을 못 고친다");
await fails(B, "insert into public.garments (id, user_id, data) values ('g2', $1, '{}')", [A], "B가 A 이름으로 못 넣는다");
assert.equal((await rows(ADMIN, "select id from public.garments")).length, 1, "관리자는 모든 옷을 본다");

// 주문은 손님이 직접 못 만들고 서버가 만든다
await fails(A, NEW_ORDER, ["o9", A], "손님은 주문을 직접 못 만든다");
await as(null, NEW_ORDER, ["o1", A]);
assert.equal((await rows(A, "select id from public.orders")).length, 1, "A는 자기 주문을 본다");
assert.equal((await rows(B, "select id from public.orders")).length, 0, "B는 A의 주문을 못 본다");
assert.equal((await as(A, "update public.orders set status = 'DELIVERED', total = 1")).affectedRows, 0, "손님은 주문을 직접 못 고친다");

// 발송 등록
await fails(B, "select public.register_shipment('o1', 'CJ대한통운', '123456789012')", [], "남의 주문은 발송 등록 못 한다");
await fails(A, "select public.register_shipment('o1', 'CJ대한통운', '1234')", [], "짧은 송장은 막는다");
await as(A, "select public.register_shipment('o1', 'CJ대한통운', '1234 5678 9012')");
assert.equal(await status(), "INBOUND_TRANSIT");
await fails(A, "select public.register_shipment('o1', 'CJ대한통운', '123456789012')", [], "두 번 등록은 막는다");

// 관리자가 확정 시안을 보내면 손님이 답한다
assert.equal((await as(B, "update public.orders set status = 'AWAITING_APPROVAL'")).affectedRows, 0, "손님은 상태를 못 바꾼다");
await as(ADMIN, "update public.orders set status = 'AWAITING_APPROVAL' where id = 'o1'");
await fails(A, "select public.answer_confirm('o1', false, '  ')", [], "조정 요청에는 내용이 있어야 한다");
await as(A, "select public.answer_confirm('o1', false, '조금 위로 올려 주세요')");
const [answered] = await rows(A, "select status, adjust_note from public.orders");
assert.deepEqual([answered.status, answered.adjust_note], ["INSPECTING", "조금 위로 올려 주세요"]);
await as(ADMIN, "update public.orders set status = 'AWAITING_APPROVAL' where id = 'o1'");
await as(A, "select public.answer_confirm('o1', true)");
assert.equal(await status(), "IN_PROGRESS");

// 별점은 받은 뒤에만
await fails(A, "select public.rate_order('o1', 5)", [], "받기 전에는 별점을 못 남긴다");
await as(ADMIN, "update public.orders set status = 'DELIVERED' where id = 'o1'");
await fails(A, "select public.rate_order('o1', 6)", [], "별점은 1~5점");
await as(A, "select public.rate_order('o1', 5)");

// 상태 기록은 바뀔 때마다 쌓이고, 주문한 손님과 관리자만 본다
const events = await rows(A, "select status, actor from public.order_events order by id");
assert.deepEqual(
  events.map((e) => e.status),
  ["AWAITING_SHIPMENT", "INBOUND_TRANSIT", "AWAITING_APPROVAL", "INSPECTING", "AWAITING_APPROVAL", "IN_PROGRESS", "DELIVERED"],
);
assert.equal(events[0].actor, A, "서버가 만든 주문은 주문한 손님 이름으로 남는다");
assert.equal(events[2].actor, ADMIN, "관리자가 바꾼 기록에는 관리자가 남는다");
assert.equal((await rows(B, "select id from public.order_events")).length, 0, "B는 A의 기록을 못 본다");

// 사진 보관함: 경로 첫 칸이 주인
await as(A, "insert into storage.objects (bucket_id, name) values ('photos', $1)", [`${A}/g1.jpg`]);
await fails(A, "insert into storage.objects (bucket_id, name) values ('photos', $1)", [`${B}/x.jpg`], "남의 폴더에는 못 올린다");
assert.equal((await rows(B, "select name from storage.objects")).length, 0, "B는 A의 사진을 못 본다");
await as(ADMIN, "insert into storage.objects (bucket_id, name) values ('photos', $1)", [`${A}/orders/o1.jpg`]);
assert.equal((await rows(A, "select name from storage.objects")).length, 2, "A는 관리자가 올린 확정 사진도 본다");

console.log("schema.sql 규칙 검사 통과");
