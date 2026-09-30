create table public.melhor_envio_connections (
  id uuid primary key,
  status text not null default 'disconnected'
    check (status in ('connected','disconnected','error')),
  access_token_encrypted text,
  refresh_token_encrypted text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  connected_by uuid references auth.users(id) on delete set null,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on public.melhor_envio_connections to service_role;
revoke all on public.melhor_envio_connections from anon, authenticated;

alter table public.melhor_envio_connections enable row level security;

create policy "admin can read melhor envio status"
  on public.melhor_envio_connections
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger t_melhor_envio_connections
  before update on public.melhor_envio_connections
  for each row execute function public.touch_updated_at();

comment on table public.melhor_envio_connections is
  'OAuth2 credentials for the store Melhor Envio integration. Tokens are encrypted at application level and never exposed to clients.';
