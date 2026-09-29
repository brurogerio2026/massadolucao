import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { settingsQuery } from "@/lib/store-queries";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Massa do Lucão" },
      { name: "description", content: "Como a Massa do Lucão trata os dados dos clientes." },
      { property: "og:title", content: "Política de privacidade — Massa do Lucão" },
      { property: "og:description", content: "Política de privacidade da loja." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/privacidade" },
    ],
    links: [{ rel: "canonical", href: "/privacidade" }],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  const { data: settings } = useQuery(settingsQuery);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-3xl uppercase">Política de privacidade</h1>
        <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
          {settings?.privacy_policy || "Conteúdo editável no painel administrativo."}
        </p>
      </section>
    </SiteLayout>
  );
}
