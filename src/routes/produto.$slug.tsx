import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductBuyBlock } from "@/components/site/ProductBuyBlock";
import { productBySlugQuery, productsQuery, priceOf } from "@/lib/store-queries";
import { formatBRL } from "@/lib/format";
import fallbackImg from "@/assets/produto-pote.jpg";

export const Route = createFileRoute("/produto/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Produto — Massa do Lucão" },
      {
        name: "description",
        content: "Detalhes do produto da Massa do Lucão, massa especial para a pesca de tilápias.",
      },
      { property: "og:title", content: "Produto — Massa do Lucão" },
      { property: "og:type", content: "product" },
      { property: "og:url", content: `/produto/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/produto/${params.slug}` }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery(productBySlugQuery(slug));
  const { data: products } = useQuery(productsQuery);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-5 py-20 text-sm text-muted-foreground">
          Carregando produto…
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h1 className="font-display text-3xl uppercase">Produto não encontrado</h1>
          <Link to="/produtos" className="mt-4 inline-block text-sm text-primary underline">
            Ver todos os produtos
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const gallery = Array.isArray(product.gallery) ? (product.gallery as string[]) : [];
  const benefits = Array.isArray(product.benefits) ? (product.benefits as string[]) : [];
  const related = (products ?? []).filter((p) => p.id !== product.id).slice(0, 3);
  const { current } = priceOf(product);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <img
              src={product.image_url ?? fallbackImg}
              alt={product.name}
              className="aspect-square w-full rounded-[1.5rem] object-cover ring-1 ring-border"
            />
            {gallery.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {gallery.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt={product.name}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl object-cover ring-1 ring-border"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-balance font-display text-4xl uppercase leading-none lg:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">{product.short_description}</p>
            <div className="mt-6">
              <ProductBuyBlock product={product} />
            </div>

            {product.description && (
              <div className="mt-8">
                <h2 className="font-display text-xl uppercase">Descrição</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            {benefits.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display text-xl uppercase">Benefícios</h2>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {benefits.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.usage_info && (
              <div className="mt-6">
                <h2 className="font-display text-xl uppercase">Informações de uso</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {product.usage_info}
                </p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl uppercase">Produtos relacionados</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/produto/$slug"
                  params={{ slug: p.slug }}
                  className="rounded-2xl bg-surface p-4 ring-1 ring-border transition-transform hover:-translate-y-1"
                >
                  <p className="font-display text-lg uppercase">{p.name}</p>
                  <p className="text-sm text-primary">{formatBRL(priceOf(p).current)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.short_description,
            sku: product.sku ?? undefined,
            offers: {
              "@type": "Offer",
              price: current,
              priceCurrency: "BRL",
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />
    </SiteLayout>
  );
}
