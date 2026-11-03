-- schema.sql을 이미 실행한 프로젝트에 '입고 실측 저장'과 '주문 취소'를 더한다. 한 번만 실행한다.
-- patch-find-order.sql을 먼저 실행해야 한다. 새로 만드는 프로젝트는 schema.sql에 이미 들어 있으니 건너뛴다.

alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check check (status in (
    'AWAITING_SHIPMENT', 'INBOUND_TRANSIT', 'INSPECTING', 'AWAITING_APPROVAL',
    'IN_PROGRESS', 'OUTBOUND_TRANSIT', 'DELIVERED', 'CANCELLED'
  ));
alter table public.orders
  add column measurements jsonb,               -- 입고 검수 실측 (cm)
  add column cancel_requested_at timestamptz,  -- 손님이 취소를 요청한 때
  add column cancel_reason text;

-- 작업을 시작하기 전이면 취소를 요청한다. 반송·환불은 운영자가 처리한 뒤 상태를 '취소'로 바꾼다
create function public.request_cancel(p_order_id text, p_reason text default null) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if length(coalesce(p_reason, '')) > 500 then
    raise exception '사유는 500자까지 적어 주세요';
  end if;
  update public.orders
     set cancel_requested_at = now(), cancel_reason = nullif(trim(p_reason), '')
   where id = p_order_id and cancel_requested_at is null
     and status in ('AWAITING_SHIPMENT', 'INBOUND_TRANSIT', 'INSPECTING', 'AWAITING_APPROVAL')
     and (user_id = (select auth.uid()) or id in (select order_id from public.found_orders()));
  if not found then
    raise exception '취소를 요청할 수 없는 주문이에요';
  end if;
end $$;

revoke execute on function public.request_cancel from public, anon;
grant execute on function public.request_cancel to authenticated;
