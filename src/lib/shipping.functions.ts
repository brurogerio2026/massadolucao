import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const quoteSchema = z.object({ destinationZip: z.string().min(8).max(9), items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(99) })).min(1).max(30) });
export const calculateShipping = createServerFn({ method: "POST" }).inputValidator((input: unknown) => quoteSchema.parse(input)).handler(async ({ data }) => {
  const [{ supabaseAdmin }, { quoteShipping }] = await Promise.all([import("@/integrations/supabase/client.server"), import("./shipping.server")]);
  return quoteShipping(supabaseAdmin, data.destinationZip, data.items);
});