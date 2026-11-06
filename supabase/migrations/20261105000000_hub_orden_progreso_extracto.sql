-- Turneoo Hub: orden de módulos, extracto de artículos y progreso por cuenta.
-- Se puede ejecutar más de una vez sin problema.

-- 1. Orden manual de los módulos. Sin valor, la categoría va al final por nombre.
alter table public.hub_categories
  add column if not exists sort_order integer;

-- 2. Extracto de texto para que /noticias no descargue el contenido completo.
--    Se calcula solo al guardar el artículo; el panel no tiene que hacer nada.
alter table public.hub_posts
  add column if not exists excerpt text
  generated always as (
    left(
      btrim(regexp_replace(
        regexp_replace(replace(coalesce(content, ''), '&nbsp;', ' '), '<[^>]*>', ' ', 'g'),
        '\s+', ' ', 'g'
      )),
      300
    )
  ) stored;

-- 3. Lecciones vistas por cada cuenta. Cada usuario solo ve y crea sus propias filas.
create table if not exists public.hub_lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_slug text not null,
  seen_at timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);

alter table public.hub_lesson_progress enable row level security;

revoke all on public.hub_lesson_progress from anon, authenticated;
grant select, insert on public.hub_lesson_progress to authenticated;

drop policy if exists "Ver mi progreso" on public.hub_lesson_progress;
create policy "Ver mi progreso"
  on public.hub_lesson_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Guardar mi progreso" on public.hub_lesson_progress;
create policy "Guardar mi progreso"
  on public.hub_lesson_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Hace que la API de Supabase vea las columnas y la tabla nuevas de inmediato.
notify pgrst, 'reload schema';
