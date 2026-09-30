import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildMelhorEnvioAuthorizationUrl,
  disconnectMelhorEnvio,
  getMelhorEnvioStatus,
} from "./melhor-envio.server";

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Acesso administrativo não autorizado.");
}

export const startMelhorEnvioOAuth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    return { url: buildMelhorEnvioAuthorizationUrl(context.userId) };
  });

export const getMelhorEnvioConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    return getMelhorEnvioStatus();
  });

export const disconnectMelhorEnvioConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ confirm: z.literal(true) }).parse(input))
  .handler(async ({ context }) => {
    await requireAdmin(context);
    await disconnectMelhorEnvio();
    return { ok: true };
  });
