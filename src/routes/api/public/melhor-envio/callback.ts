import { createFileRoute } from "@tanstack/react-router";
import { exchangeAuthorizationCode } from "@/lib/melhor-envio.server";

export const Route = createFileRoute("/api/public/melhor-envio/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const oauthError = url.searchParams.get("error");

        const redirect = (result: "connected" | "error") => {
          const target = new URL("/admin", request.url);
          target.searchParams.set("melhor_envio", result);
          return Response.redirect(target.toString(), 303);
        };

        if (oauthError || !code || !state) {
          console.error("Melhor Envio OAuth callback rejected.");
          return redirect("error");
        }

        try {
          await exchangeAuthorizationCode(code, state);
          return redirect("connected");
        } catch (error) {
          console.error("Melhor Envio OAuth callback failed:", error instanceof Error ? error.message : error);
          return redirect("error");
        }
      },
    },
  },
});
