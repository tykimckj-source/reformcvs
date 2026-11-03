-- 리폼편의점 MVP 데이터베이스. Supabase 대시보드 → SQL Editor에 통째로 붙여 넣고 한 번 실행한다.
-- 화면이 쓰는 객체(옷·시안·견적)는 data(jsonb)에 그대로 담고, 주인·상태처럼 규칙이 필요한 값만 칸으로 둔다.
-- shortcut: 옷·시안·견적이 jsonb 한 칸이라 통계 쿼리가 불편하다. 주문이 쌓여 분석이 필요해지면 칸으로 나눈다.
-- 규칙 검사: npm run db:check

-- 관리자 ---------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users on delete cascade
);
alter table public.admins enable row level security;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = (select auth.uid())) $$;

-- 손님 체험 기록 (로그인 전에는 익명 계정으로 쌓인다) -------------------
create table public.garments (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  photo_path text,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table public.mockup_sessions (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  garment_id text not null references public.garments on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table public.quotes (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  session_id text not null references public.mockup_sessions on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- 주문 -----------------------------------------------------------------
-- 주문은 서버(/api/orders)가 가격을 다시 계산해 만들고, 손님은 아래 함수로만 상태를 바꾼다.
create table public.orders (
  id text primary key,
  order_no text not null unique,
  user_id uuid not null references auth.users on delete cascade,
  quote_id text not null references public.quotes,
  session_id text not null references public.mockup_sessions,
  status text not null default 'AWAITING_SHIPMENT' check (status in (
    'AWAITING_SHIPMENT', 'INBOUND_TRANSIT', 'INSPECTING', 'AWAITING_APPROVAL',
    'IN_PROGRESS', 'OUTBOUND_TRANSIT', 'DELIVERED'
  )),
  total integer not null check (total > 0),
  customer jsonb not null,          -- 이름·연락처·주소
  consents jsonb not null,          -- 약관 동의와 시각
  tracking jsonb,                   -- 손님이 보낸 택배
  outbound jsonb,                   -- 돌려보내는 택배
  confirm_photo_path text,          -- 입고 후 실물 사진
  confirm_note text,
  adjust_note text,
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders on delete cascade,
  status text not null,
  actor uuid,
  at timestamptz not null default now()
);
create index order_events_order_id on public.order_events (order_id);

-- 상태가 바뀔 때마다 누가 언제 바꿨는지 남긴다
create function public.log_order_status() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_events (order_id, status, actor)
    values (new.id, new.status, coalesce((select auth.uid()), new.user_id));
  end if;
  return new;
end $$;

create trigger orders_status_log
after insert or update of status on public.orders
for each row execute function public.log_order_status();

-- 접근 규칙 ------------------------------------------------------------
alter table public.garments enable row level security;
alter table public.mockup_sessions enable row level security;
alter table public.quotes enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;

create policy "본인 기록" on public.garments for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "관리자 열람" on public.garments for select to authenticated
  using (public.is_admin());

create policy "본인 기록" on public.mockup_sessions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "관리자 열람" on public.mockup_sessions for select to authenticated
  using (public.is_admin());

create policy "본인 기록" on public.quotes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "관리자 열람" on public.quotes for select to authenticated
  using (public.is_admin());

create policy "본인·관리자 열람" on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
create policy "관리자 수정" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "본인·관리자 열람" on public.order_events for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
  );

-- 손님이 상태를 바꾸는 세 가지 ------------------------------------------
-- 발송 대기 → 작업실로 가는 중
create function public.register_shipment(p_order_id text, p_carrier text, p_number text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if length(regexp_replace(coalesce(p_number, ''), '\D', '', 'g')) < 8
     or length(p_number) > 40
     or length(coalesce(p_carrier, '')) not between 1 and 30 then
    raise exception '송장 번호를 다시 확인해 주세요';
  end if;
  update public.orders
     set tracking = jsonb_build_object('carrier', p_carrier, 'number', p_number),
         status = 'INBOUND_TRANSIT'
   where id = p_order_id and user_id = (select auth.uid()) and status = 'AWAITING_SHIPMENT';
  if not found then
    raise exception '발송을 등록할 수 없는 주문이에요';
  end if;
end $$;

-- 확정 시안에 답하기: 승인하면 작업, 조정을 요청하면 다시 검수
create function public.answer_confirm(p_order_id text, p_approve boolean, p_note text default null) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not p_approve and length(trim(coalesce(p_note, ''))) not between 1 and 500 then
    raise exception '요청 내용을 적어 주세요';
  end if;
  update public.orders
     set status = case when p_approve then 'IN_PROGRESS' else 'INSPECTING' end,
         adjust_note = case when p_approve then adjust_note else trim(p_note) end
   where id = p_order_id and user_id = (select auth.uid()) and status = 'AWAITING_APPROVAL';
  if not found then
    raise exception '답할 수 있는 확정 시안이 없어요';
  end if;
end $$;

-- 받은 뒤 별점
create function public.rate_order(p_order_id text, p_rating integer) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception '별점은 1~5점이에요';
  end if;
  update public.orders set rating = p_rating
   where id = p_order_id and user_id = (select auth.uid()) and status = 'DELIVERED';
  if not found then
    raise exception '받은 주문에만 별점을 남길 수 있어요';
  end if;
end $$;

revoke execute on function public.register_shipment, public.answer_confirm, public.rate_order from public, anon;
grant execute on function public.register_shipment, public.answer_confirm, public.rate_order to authenticated;

-- 사진 보관함 (비공개). 경로 첫 칸이 주인의 user id다 --------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "사진: 본인 폴더" on storage.objects for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "사진: 관리자" on storage.objects for all to authenticated
  using (bucket_id = 'photos' and public.is_admin())
  with check (bucket_id = 'photos' and public.is_admin());

-- 관리자가 상태를 바꾸면 손님 화면과 주문 보드가 바로 따라오게 한다
alter publication supabase_realtime add table public.orders;
