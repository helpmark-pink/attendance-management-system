-- 1) 必要な拡張機能
create extension if not exists "pgcrypto";

-- 2) 従業員テーブル
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  employee_id text unique not null,
  department text not null,
  role text not null default 'employee' check (role in ('employee','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) 出退勤記録テーブル
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  clock_in timestamptz not null,
  clock_out timestamptz,
  break_minutes integer default 0,
  work_minutes integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4) インデックス
create index if not exists idx_attendance_employee_id on public.attendance_records(employee_id);
create index if not exists idx_attendance_clock_in on public.attendance_records(clock_in);

-- 5) updated_at を自動更新する関数
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- 6) トリガー（存在しない場合のみ作成）
do $trigger$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_employees_updated_at'
  ) then
    create trigger trg_employees_updated_at
      before update on public.employees
      for each row execute function public.update_updated_at_column();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'trg_attendance_records_updated_at'
  ) then
    create trigger trg_attendance_records_updated_at
      before update on public.attendance_records
      for each row execute function public.update_updated_at_column();
  end if;
end;
$trigger$;

-- 7) RLS を有効化
alter table public.employees enable row level security;
alter table public.attendance_records enable row level security;

-- 8) RLS ポリシー（存在しなければ追加）
do $policy$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'employees'
      and policyname = 'employee_select_own'
  ) then
    create policy employee_select_own on public.employees
      for select using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'employees'
      and policyname = 'employee_insert_self'
  ) then
    create policy employee_insert_self on public.employees
      for insert with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'employees'
      and policyname = 'admin_all_employees'
  ) then
    create policy admin_all_employees on public.employees
      for all using (
        exists (
          select 1 from public.employees
          where id = auth.uid() and role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'attendance_records'
      and policyname = 'attendance_select_own'
  ) then
    create policy attendance_select_own on public.attendance_records
      for select using (employee_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'attendance_records'
      and policyname = 'attendance_insert_self'
  ) then
    create policy attendance_insert_self on public.attendance_records
      for insert with check (employee_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'attendance_records'
      and policyname = 'attendance_update_self'
  ) then
    create policy attendance_update_self on public.attendance_records
      for update using (employee_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'attendance_records'
      and policyname = 'admin_all_attendance'
  ) then
    create policy admin_all_attendance on public.attendance_records
      for all using (
        exists (
          select 1 from public.employees
          where id = auth.uid() and role = 'admin'
        )
      );
  end if;
end;
$policy$;

-- 9) 新規ユーザー作成時に従業員レコードを補完する関数とトリガー
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  meta jsonb := new.raw_user_meta_data;
  meta_name text := coalesce(nullif(meta->>'name', ''), new.email);
  meta_employee_id text := nullif(meta->>'employee_id', '');
  meta_department text := coalesce(nullif(meta->>'department', ''), '未設定');
  meta_role text := coalesce(nullif(meta->>'role', ''), 'employee');
begin
  insert into public.employees (id, email, name, employee_id, department, role)
  values (
    new.id,
    new.email,
    meta_name,
    coalesce(meta_employee_id, 'EMP-' || right(cast(extract(epoch from now()) as text), 6)),
    meta_department,
    meta_role
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    employee_id = excluded.employee_id,
    department = excluded.department,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$function$;

do $auth_trigger$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_handle_new_auth_user'
  ) then
    create trigger trg_handle_new_auth_user
      after insert on auth.users
      for each row execute function public.handle_new_auth_user();
  end if;
end;
$auth_trigger$;
