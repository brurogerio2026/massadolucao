import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildMelhorEnvioAuthorizationUrl,
  disconnectMelhorEnvio,
  getMelhorEnvioStatus,
  getMelhorEnvioConfiguration,
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


export const getMelhorEnvioConfigurationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const config = getMelhorEnvioConfiguration();
    return {
      environment: config.environment,
      clientIdMasked: config.clientIdMasked,
      clientSecretConfigured: config.clientSecretConfigured,
      clientSecretLength: config.clientSecretLength,
      clientSecretFingerprint: config.clientSecretFingerprint,
      redirectUri: config.redirectUri,
      redirectUriValid: config.redirectUriValid,
      tokenUrl: config.tokenUrl,
      authorizeUrl: config.authorizeUrl,
      userAgent: config.userAgent,
    };
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
