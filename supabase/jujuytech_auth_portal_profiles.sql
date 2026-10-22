-- JujuyTech V8: roles de portal asociados a usuarios autenticados.
-- La interfaz no decide permisos municipales. Solo un operador autorizado
-- puede promover un perfil a 'municipality' mediante SQL administrativo.
create table if not exists public.user_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'community' check (role in ('community','business','municipality')),
    display_name varchar(120),
    created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
revoke all on table public.user_profiles from anon, authenticated;
grant select on public.user_profiles to authenticated;
grant update (role) on public.user_profiles to authenticated;

create policy user_profiles_read_self
    on public.user_profiles for select to authenticated
    using ((select auth.uid()) = user_id);

-- Google OAuth no puede adjuntar un rol seguro durante la redirección.
-- Permitimos convertir cuentas recién creadas de Comunidad a Empresa
-- únicamente durante su activación inicial; municipio jamás es autogestionado.
create policy user_profiles_choose_business_on_initial_signup
    on public.user_profiles for update to authenticated
    using (
        (select auth.uid()) = user_id
        and role = 'community'
        and created_at > now() - interval '30 minutes'
    )
    with check (
        (select auth.uid()) = user_id
        and role = 'business'
        and created_at > now() - interval '30 minutes'
    );

create schema if not exists jujuy_private;
revoke all on schema jujuy_private from public, anon, authenticated;

create or replace function jujuy_private.create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.user_profiles (user_id, role, display_name)
    values (
        new.id,
        case when new.raw_user_meta_data->>'portal' = 'business' then 'business' else 'community' end,
        nullif(left(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), 120), '')
    )
    on conflict (user_id) do nothing;
    return new;
end;
$$;
revoke all on function jujuy_private.create_user_profile() from public, anon, authenticated;

drop trigger if exists on_jujuytech_auth_user_created on auth.users;
create trigger on_jujuytech_auth_user_created
    after insert on auth.users
    for each row execute function jujuy_private.create_user_profile();

insert into public.user_profiles(user_id,role)
select id, 'community' from auth.users
on conflict (user_id) do nothing;
