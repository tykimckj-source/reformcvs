-- schema.sql을 이미 실행한 프로젝트에 '다른 브라우저에서 주문 찾기'를 더한다. 한 번만 실행한다.
-- 새로 만드는 프로젝트는 schema.sql에 이미 들어 있으니 이 파일은 건너뛴다.

-- 다른 브라우저에서 주문 찾기 ---------------------------------------------
-- 손님 계정은 브라우저마다 따로 생기는 익명 계정이다. 주문번호와 연락처가 맞으면 지금 계정에도 그 주문을 열어 준다.
create table public.order_access (
  order_id text not null references public.orders on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (order_id, user_id)
);
create table public.order_lookups (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  phone text not null,
  ok boolean not null,
  at timestamptz not null default now()
);
-- 정책이 없으니 손님은 두 표를 직접 못 읽고, 아래 함수로만 쓴다
alter table public.order_access enable row level security;
alter table public.order_lookups enable row level security;

-- 지금 계정이 찾아서 연 주문과, 그 주문 화면에 필요한 시안·옷·사진
create function public.found_orders()
returns table (order_id text, session_id text, garment_id text, photo_path text, confirm_photo_path text)
language sql stable security definer set search_path = ''
as $$
  select o.id, o.session_id, s.garment_id, g.photo_path, o.confirm_photo_path
    from public.order_access a
    join public.orders o on o.id = a.order_id
    join public.mockup_sessions s on s.id = o.session_id
    join public.garments g on g.id = s.garment_id
   where a.user_id = (select auth.uid())
$$;

-- 주문번호와 연락처로 주문을 찾아 지금 계정에 연다. 못 찾으면 null
create function public.find_order(p_order_no text, p_phone text) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_id text;
begin
  -- 주문번호를 하나씩 넣어 보는 것을 막는다: 같은 연락처나 같은 계정으로 하루 10번 틀리면 멈춘다
  if (select count(*) from public.order_lookups
       where not ok and at > now() - interval '1 day'
         and (phone = v_phone or user_id = (select auth.uid()))) >= 10 then
    raise exception '여러 번 틀려서 잠시 막았어요. 내일 다시 찾거나 문의해 주세요';
  end if;
  select id into v_id from public.orders
   where order_no = upper(trim(coalesce(p_order_no, '')))
     and regexp_replace(customer->>'phone', '\D', '', 'g') = v_phone
     and v_phone <> '';
  -- 실패도 남겨야 하니 예외 대신 null을 돌려준다 (예외는 기록까지 되돌린다)
  insert into public.order_lookups (user_id, phone, ok) values ((select auth.uid()), v_phone, v_id is not null);
  if v_id is not null then
    insert into public.order_access (order_id, user_id) values (v_id, (select auth.uid())) on conflict do nothing;
  end if;
  return v_id;
end $$;

-- 접근 규칙: 찾은 주문은 주문 화면에 필요한 것만 연다 -------------------
create policy "찾은 주문의 옷" on public.garments for select to authenticated
  using (id in (select garment_id from public.found_orders()));
create policy "찾은 주문의 시안" on public.mockup_sessions for select to authenticated
  using (id in (select session_id from public.found_orders()));
alter policy "본인·관리자 열람" on public.orders
  using (user_id = (select auth.uid()) or public.is_admin() or id in (select order_id from public.found_orders()));
alter policy "본인·관리자 열람" on public.order_events
  using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
    or order_id in (select order_id from public.found_orders())
  );
create policy "사진: 찾은 주문" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and name in (
    select photo_path from public.found_orders() union select confirm_photo_path from public.found_orders()
  ));

-- 손님이 상태를 바꾸는 세 가지: 찾은 계정도 바꿀 수 있게 -----------------
create or replace function public.register_shipment(p_order_id text, p_carrier text, p_number text) returns void
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
   where id = p_order_id and status = 'AWAITING_SHIPMENT'
     and (user_id = (select auth.uid()) or id in (select order_id from public.found_orders()));
  if not found then
    raise exception '발송을 등록할 수 없는 주문이에요';
  end if;
end $$;

create or replace function public.answer_confirm(p_order_id text, p_approve boolean, p_note text default null) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not p_approve and length(trim(coalesce(p_note, ''))) not between 1 and 500 then
    raise exception '요청 내용을 적어 주세요';
  end if;
  update public.orders
     set status = case when p_approve then 'IN_PROGRESS' else 'INSPECTING' end,
         adjust_note = case when p_approve then adjust_note else trim(p_note) end
   where id = p_order_id and status = 'AWAITING_APPROVAL'
     and (user_id = (select auth.uid()) or id in (select order_id from public.found_orders()));
  if not found then
    raise exception '답할 수 있는 확정 시안이 없어요';
  end if;
end $$;

create or replace function public.rate_order(p_order_id text, p_rating integer) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception '별점은 1~5점이에요';
  end if;
  update public.orders set rating = p_rating
   where id = p_order_id and status = 'DELIVERED'
     and (user_id = (select auth.uid()) or id in (select order_id from public.found_orders()));
  if not found then
    raise exception '받은 주문에만 별점을 남길 수 있어요';
  end if;
end $$;

revoke execute on function public.find_order, public.found_orders from public, anon;
grant execute on function public.find_order, public.found_orders to authenticated;
