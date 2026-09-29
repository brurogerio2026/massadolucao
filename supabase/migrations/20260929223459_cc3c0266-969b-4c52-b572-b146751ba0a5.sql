CREATE OR REPLACE FUNCTION public.process_approved_payment(
  p_order_id uuid,
  p_provider_payment_id text,
  p_status text,
  p_amount numeric,
  p_payment_method text,
  p_raw jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item record;
  existing_status public.payment_status;
BEGIN
  SELECT payment_status INTO existing_status
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.payments
    WHERE provider = 'mercadopago'
      AND provider_payment_id = p_provider_payment_id
  ) OR existing_status = 'approved' THEN
    RETURN false;
  END IF;

  FOR item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id AND product_id IS NOT NULL
  LOOP
    UPDATE public.products
    SET stock = stock - item.quantity
    WHERE id = item.product_id AND stock >= item.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient stock';
    END IF;
  END LOOP;

  INSERT INTO public.payments (order_id, provider, provider_payment_id, status, amount, raw)
  VALUES (p_order_id, 'mercadopago', p_provider_payment_id, p_status, p_amount, p_raw)
  ON CONFLICT (provider, provider_payment_id) WHERE provider_payment_id IS NOT NULL DO NOTHING;

  UPDATE public.orders
  SET payment_status = 'approved',
      order_status = 'paid',
      mp_payment_id = p_provider_payment_id,
      payment_method = COALESCE(p_payment_method, 'mercadopago')
  WHERE id = p_order_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.process_approved_payment(uuid, text, text, numeric, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_approved_payment(uuid, text, text, numeric, text, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.process_approved_payment(uuid, text, text, numeric, text, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_approved_payment(uuid, text, text, numeric, text, jsonb) TO service_role;