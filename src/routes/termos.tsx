import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { settingsQuery } from "@/lib/store-queries";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Massa do Lucão" },
      { name: "description", content: "Termos de uso da loja Massa do Lucão." },
      { property: "og:title", content: "Termos de uso — Massa do Lucão" },
      { property: "og:description", content: "Termos de uso da loja." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/termos" },
    ],
    links: [{ rel: "canonical", href: "/termos" }],
  }),
  component: TermosPage,
});

function TermosPage() {
  const { data: settings } = useQuery(settingsQuery);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-3xl uppercase">Termos de uso</h1>
        <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
          {settings?.terms || "Conteúdo editável no painel administrativo."}
        </p>
      </section>
    </SiteLayout>
  );
}
