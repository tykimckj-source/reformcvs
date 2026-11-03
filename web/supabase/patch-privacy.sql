-- schema.sql을 이미 실행한 프로젝트에 '체험 기록 지우기(서버)'와 'AI 학습 동의 철회'를 더한다. 한 번만 실행한다.
-- 앞의 patch-*.sql(find-order → measure-cancel → manual)을 먼저 실행해야 한다. 새로 만드는 프로젝트는 건너뛴다.

-- 손님 기록 지우기와 동의 철회 ---------------------------------------------
-- '체험 기록 지우기': 주문에 쓰이지 않은 내 옷·시안·견적·디자이너 시안 요청과 찾은 주문 열람을 지우고,
-- 지울 사진 경로를 돌려준다(사진 파일은 SQL로 못 지워 화면이 보관함 API로 지운다).
-- 주문과 그 주문의 옷·시안·견적은 법정 보관 기간 동안 남긴다.
create function public.forget_my_trials() returns text[]
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_paths text[];
begin
  if v_uid is null then
    raise exception '로그인 정보가 없어요';
  end if;
  select coalesce(array_agg(p), '{}') into v_paths from (
    select g.photo_path as p from public.garments g
     where g.user_id = v_uid and g.photo_path is not null
       and g.id not in (select s.garment_id from public.mockup_sessions s join public.orders o on o.session_id = s.id where o.user_id = v_uid)
    union all
    select m.photo_path from public.manual_requests m
     where m.user_id = v_uid and m.photo_path is not null
       and m.session_id not in (select o.session_id from public.orders o where o.user_id = v_uid)
  ) photos;
  delete from public.quotes where user_id = v_uid and id not in (select o.quote_id from public.orders o where o.user_id = v_uid);
  delete from public.mockup_sessions where user_id = v_uid and id not in (select o.session_id from public.orders o where o.user_id = v_uid);
  delete from public.garments where user_id = v_uid and id not in (select s.garment_id from public.mockup_sessions s where s.user_id = v_uid);
  delete from public.order_access where user_id = v_uid;
  return v_paths;
end $$;

-- AI 학습 활용(선택) 동의를 철회한다. 철회한 때를 함께 남긴다
create function public.withdraw_learning(p_order_id text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.orders
     set consents = consents || jsonb_build_object('learn', false, 'learnWithdrawnAt', now())
   where id = p_order_id and (consents->>'learn')::boolean
     and (user_id = (select auth.uid()) or id in (select order_id from public.found_orders()));
  if not found then
    raise exception '철회할 동의가 없어요';
  end if;
end $$;

revoke execute on function public.forget_my_trials, public.withdraw_learning from public, anon;
grant execute on function public.forget_my_trials, public.withdraw_learning to authenticated;
