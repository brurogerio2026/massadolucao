import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { productsQuery, priceOf } from "@/lib/store-queries";
import { formatBRL } from "@/lib/format";
import heroImg from "@/assets/produto-pote.jpg";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Massa do Lucão" },
      {
        name: "description",
        content: "Todos os produtos da Massa do Lucão: massa para pescar tilápia com envio para todo o Brasil.",
      },
      { property: "og:title", content: "Produtos — Massa do Lucão" },
      { property: "og:description", content: "Massa para pesca de tilápia, direto de quem pesca." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://massadolucao.lovable.app/produtos" },
    ],
    links: [{ rel: "canonical", href: "https://massadolucao.lovable.app/produtos" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products, isLoading } = useQuery(productsQuery);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-display text-4xl uppercase lg:text-5xl">Produtos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha sua massa e prepare a próxima pescaria.
        </p>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando produtos…</p>}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((p) => {
            const { current, original } = priceOf(p);
            return (
              <Link
                key={p.id}
                to="/produto/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-2xl bg-surface ring-1 ring-border transition-transform hover:-translate-y-1"
              >
                <img
                  src={p.image_url ?? heroImg}
                  alt={p.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                <div className="p-4">
                  <p className="font-display text-xl uppercase tracking-wide">{p.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {p.short_description}
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="font-display text-2xl text-primary">{formatBRL(current)}</span>
                    {original && (
                      <span className="pb-1 text-xs text-muted-foreground line-through">
                        {formatBRL(original)}
                      </span>
                    )}
                  </div>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {p.stock > 0 ? "Em estoque" : "Esgotado"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
