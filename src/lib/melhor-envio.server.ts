import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ME_CONNECTION_ID = "00000000-0000-0000-0000-000000000001";
const AUTHORIZE_URL = "https://melhorenvio.com.br/oauth/authorize";
const TOKEN_URL = "https://melhorenvio.com.br/oauth/token";
const API_URL = "https://melhorenvio.com.br";

type ConnectionRow = {
  id: string;
  status: "connected" | "disconnected" | "error";
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  access_token_expires_at: string | null;
  refresh_token_expires_at: string | null;
  connected_by: string | null;
  last_error: string | null;
};

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

function encryptionKey(): Buffer {
  const raw = requiredEnv("MELHOR_ENVIO_TOKEN_ENCRYPTION_KEY");
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  const decoded = Buffer.from(raw, "base64");
  if (decoded.length === 32) return decoded;
  throw new Error("MELHOR_ENVIO_TOKEN_ENCRYPTION_KEY deve ter 32 bytes.");
}

function stateSecret(): string {
  return requiredEnv("MELHOR_ENVIO_OAUTH_STATE_SECRET");
}

function encrypt(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

function decrypt(value: string): string {
  const [ivPart, tagPart, ciphertextPart] = value.split(".");
  if (!ivPart || !tagPart || !ciphertextPart) throw new Error("Token armazenado inválido.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function base64url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function fromBase64url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function createOAuthState(userId: string): string {
  const payload = base64url(JSON.stringify({
    sub: userId,
    nonce: randomBytes(16).toString("hex"),
    exp: Date.now() + 10 * 60 * 1000,
  }));
  const signature = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyOAuthState(state: string): { userId: string } {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) throw new Error("Estado OAuth inválido.");
  const expected = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Estado OAuth inválido.");
  const data = JSON.parse(fromBase64url(payload)) as { sub?: string; exp?: number };
  if (!data.sub || !data.exp || data.exp < Date.now()) throw new Error("Estado OAuth expirado.");
  return { userId: data.sub };
}

function redirectUri(): string {
  return requiredEnv("MELHOR_ENVIO_REDIRECT_URI");
}

function appUserAgent(): string {
  return process.env["MELHOR_ENVIO_USER_AGENT"] ?? "Massa do Lucao (contato@massadolucao.com.br)";
}

function tokenExpiresAt(token: string, expiresIn?: number): string {
  if (expiresIn && expiresIn > 0) return new Date(Date.now() + expiresIn * 1000).toISOString();
  try {
    const [, payload] = token.split(".");
    if (payload) {
      const data = JSON.parse(fromBase64url(payload)) as { exp?: number };
      if (data.exp) return new Date(data.exp * 1000).toISOString();
    }
  } catch {
    // Fall back to the documented 30-day access-token lifetime.
  }
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

function refreshExpiresAt(token: string, previous: string | null, rotated: boolean): string | null {
  try {
    const [, payload] = token.split(".");
    if (payload) {
      const data = JSON.parse(fromBase64url(payload)) as { exp?: number };
      if (data.exp) return new Date(data.exp * 1000).toISOString();
    }
  } catch {
    // Use the documented lifetime below when no JWT exp is available.
  }
  if (!rotated) return previous;
  return new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();
}

async function loadConnection(): Promise<ConnectionRow | null> {
  const { data, error } = await (supabaseAdmin as any)
    .from("melhor_envio_connections")
    .select("*")
    .eq("id", ME_CONNECTION_ID)
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar a integração do Melhor Envio.");
  return data as ConnectionRow | null;
}

async function saveConnection(values: Record<string, unknown>): Promise<void> {
  const { error } = await (supabaseAdmin as any)
    .from("melhor_envio_connections")
    .upsert({ id: ME_CONNECTION_ID, ...values }, { onConflict: "id" });
  if (error) throw new Error("Não foi possível salvar a integração do Melhor Envio.");
}

async function requestToken(params: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": appUserAgent(),
    },
    body: params.toString(),
  });
  const body = await response.text();
  let parsed: any = null;
  try { parsed = JSON.parse(body); } catch {}
  if (!response.ok || !parsed?.access_token) {
    const providerError =
      typeof parsed?.error_description === "string"
        ? parsed.error_description
        : typeof parsed?.error === "string"
          ? parsed.error
          : `HTTP ${response.status}`;
    console.error(`Melhor Envio OAuth failed [${response.status}]: ${providerError}`);
    throw new Error(providerError);
  }
  return parsed as TokenResponse;
}

export function buildMelhorEnvioAuthorizationUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: requiredEnv("MELHOR_ENVIO_CLIENT_ID"),
    redirect_uri: redirectUri(),
    response_type: "code",
    state: createOAuthState(userId),
    scope: "shipping-calculate shipping-companies ecommerce-shipping",
  });
  return `${AUTHORIZE_URL}?${params.toString().replace(/%20/g, "+")}`;
}

export async function exchangeAuthorizationCode(code: string, state: string): Promise<void> {
  const { userId } = verifyOAuthState(state);
  const token = await requestToken(new URLSearchParams({
    grant_type: "authorization_code",
    client_id: requiredEnv("MELHOR_ENVIO_CLIENT_ID"),
    client_secret: requiredEnv("MELHOR_ENVIO_CLIENT_SECRET"),
    redirect_uri: redirectUri(),
    code,
  }));
  const refreshToken = token.refresh_token;
  if (!refreshToken) throw new Error("O Melhor Envio não retornou refresh token.");

  await saveConnection({
    status: "connected",
    access_token_encrypted: encrypt(token.access_token),
    refresh_token_encrypted: encrypt(refreshToken),
    access_token_expires_at: tokenExpiresAt(token.access_token, token.expires_in),
    refresh_token_expires_at: refreshExpiresAt(refreshToken, null, true),
    connected_by: userId,
    last_error: null,
  });
}

export async function refreshMelhorEnvioToken(): Promise<string> {
  const connection = await loadConnection();
  if (!connection?.refresh_token_encrypted) throw new Error("A integração do Melhor Envio precisa ser reconectada.");
  const refreshToken = decrypt(connection.refresh_token_encrypted);
  if (connection.refresh_token_expires_at && new Date(connection.refresh_token_expires_at).getTime() <= Date.now()) {
    await saveConnection({ status: "disconnected", last_error: "Refresh token expirado." });
    throw new Error("A integração do Melhor Envio precisa ser reconectada.");
  }

  try {
    const token = await requestToken(new URLSearchParams({
      grant_type: "refresh_token",
      client_id: requiredEnv("MELHOR_ENVIO_CLIENT_ID"),
      client_secret: requiredEnv("MELHOR_ENVIO_CLIENT_SECRET"),
      refresh_token: refreshToken,
    }));
    const nextRefresh = token.refresh_token ?? refreshToken;
    await saveConnection({
      status: "connected",
      access_token_encrypted: encrypt(token.access_token),
      refresh_token_encrypted: encrypt(nextRefresh),
      access_token_expires_at: tokenExpiresAt(token.access_token, token.expires_in),
      refresh_token_expires_at: refreshExpiresAt(nextRefresh, connection.refresh_token_expires_at, Boolean(token.refresh_token)),
      last_error: null,
    });
    return token.access_token;
  } catch (error) {
    await saveConnection({ status: "error", last_error: error instanceof Error ? error.message : "Falha ao renovar token." });
    throw new Error("A integração do Melhor Envio precisa ser reconectada.");
  }
}

export async function getMelhorEnvioAccessToken(forceRefresh = false): Promise<string> {
  const connection = await loadConnection();
  if (!connection?.access_token_encrypted) throw new Error("A integração do Melhor Envio precisa ser conectada.");
  if (forceRefresh || !connection.access_token_expires_at || new Date(connection.access_token_expires_at).getTime() <= Date.now() + 2 * 60 * 1000) {
    return refreshMelhorEnvioToken();
  }
  return decrypt(connection.access_token_encrypted);
}

export async function requestMelhorEnvio(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<Response> {
  const settingsResult = await (supabaseAdmin as any).from("store_settings").select("email").limit(1).maybeSingle();
  const email = settingsResult.data?.email ?? "contato@massadolucao.com.br";
  const token = await getMelhorEnvioAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("User-Agent", `Massa do Lucao (${email})`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status !== 401 || !retry) return response;

  const refreshedToken = await getMelhorEnvioAccessToken(true);
  headers.set("Authorization", `Bearer ${refreshedToken}`);
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

export async function getMelhorEnvioStatus(): Promise<{
  connected: boolean;
  status: ConnectionRow["status"];
  expiresAt: string | null;
  refreshExpiresAt: string | null;
  lastError: string | null;
}> {
  const connection = await loadConnection();
  if (!connection?.access_token_encrypted) {
    return { connected: false, status: "disconnected", expiresAt: null, refreshExpiresAt: null, lastError: connection?.last_error ?? null };
  }
  const expired = Boolean(connection.refresh_token_expires_at && new Date(connection.refresh_token_expires_at).getTime() <= Date.now());
  return {
    connected: !expired,
    status: expired ? "disconnected" : connection.status,
    expiresAt: connection.access_token_expires_at,
    refreshExpiresAt: connection.refresh_token_expires_at,
    lastError: connection.last_error,
  };
}

export async function disconnectMelhorEnvio(): Promise<void> {
  await saveConnection({
    status: "disconnected",
    access_token_encrypted: null,
    refresh_token_encrypted: null,
    access_token_expires_at: null,
    refresh_token_expires_at: null,
    last_error: null,
  });
}

export { verifyOAuthState };
