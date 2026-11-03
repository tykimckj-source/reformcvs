-- schema.sql을 이미 실행한 프로젝트에 '디자이너 수동 시안'을 더한다. 한 번만 실행한다.
-- patch-find-order.sql, patch-measure-cancel.sql을 먼저 실행해야 한다. 새로 만드는 프로젝트는 건너뛴다.

-- 디자이너 수동 시안 -----------------------------------------------------
-- AI 시안이 마음에 들지 않으면 손님이 요청하고, 디자이너가 만든 시안 이미지를 보낸다.
-- 손님은 요청만 남기고, 답(이미지·메모)은 관리자만 쓴다.
create table public.manual_requests (
  session_id text primary key references public.mockup_sessions on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  note text check (length(note) <= 500),        -- 손님이 바라는 점
  phone text check (length(phone) <= 20),       -- 완성되면 알릴 연락처 (선택)
  requested_at timestamptz not null default now(),
  photo_path text,                              -- 디자이너가 만든 시안 이미지
  reply_note text,
  done_at timestamptz
);
alter table public.manual_requests enable row level security;

create policy "본인·관리자 열람" on public.manual_requests for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
create policy "본인 시안에 요청" on public.manual_requests for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.mockup_sessions s where s.id = session_id and s.user_id = (select auth.uid()))
    and photo_path is null and reply_note is null and done_at is null
  );
create policy "관리자 답장" on public.manual_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter publication supabase_realtime add table public.manual_requests;
