create or replace function public.lookup_customer_orders(p_cpf text, p_email text)
returns table (
  order_number integer,
  payment_status text,
  order_status text,
  tracking_code text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select o.order_number,
         o.payment_status::text,
         o.order_status::text,
         o.tracking_code,
         o.created_at
  from public.orders o
  where regexp_replace(coalesce(o.customer_cpf, ''), '[^0-9]', '', 'g') = regexp_replace(coalesce(p_cpf, ''), '[^0-9]', '', 'g')
    and lower(trim(o.customer_email)) = lower(trim(p_email))
  order by o.created_at desc
  limit 10;
$$;

revoke all on function public.lookup_customer_orders(text, text) from public;
grant execute on function public.lookup_customer_orders(text, text) to anon, authenticated;

comment on function public.lookup_customer_orders(text, text) is
  'Returns limited order tracking details only when both CPF and checkout email match.';
