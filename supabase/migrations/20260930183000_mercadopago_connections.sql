create table if not exists public.mercadopago_connections (
 id uuid primary key,
 status text not null default 'disconnected' check(status in ('connected','disconnected','error')),
 environment text not null default 'test' check(environment in ('test','production')),
 access_token_encrypted text,
 public_key text,
 connected_by uuid references auth.users(id) on delete set null,
 last_error text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
grant all on public.mercadopago_connections to service_role;
revoke all on public.mercadopago_connections from anon, authenticated;
alter table public.mercadopago_connections enable row level security;
create policy "admin can read mercado pago status" on public.mercadopago_connections for select to authenticated using(public.has_role(auth.uid(),'admin'));
create trigger t_mercadopago_connections before update on public.mercadopago_connections for each row execute function public.touch_updated_at();
comment on table public.mercadopago_connections is 'Mercado Pago credentials; private credentials are encrypted and never exposed to clients.';
