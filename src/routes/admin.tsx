import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — Massa do Lucão" },
      { name: "description", content: "Área administrativa da loja Massa do Lucão." },
      { property: "og:title", content: "Painel administrativo — Massa do Lucão" },
      { property: "og:description", content: "Área restrita da loja." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPlaceholder,
});

function AdminPlaceholder() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-4xl uppercase">Painel administrativo</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          O painel com login, produtos, pedidos, banners, depoimentos, FAQ, galeria e configurações
          está em construção e entra na próxima etapa.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm text-primary underline">
          Voltar para a loja
        </Link>
      </section>
    </SiteLayout>
  );
}
