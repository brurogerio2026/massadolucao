import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductBuyBlock } from "@/components/site/ProductBuyBlock";
import {
  benefitsQuery,
  faqsQuery,
  galleryQuery,
  productsQuery,
  settingsQuery,
  testimonialsQuery,
  usageStepsQuery,
  priceOf,
} from "@/lib/store-queries";
import { formatBRL } from "@/lib/format";
import heroImg from "@/assets/produto-pote.jpg";
import iscaImg from "@/assets/isca-anzol.jpg";
import linhaImg from "@/assets/linha-agua.jpg";
import tilapiaImg from "@/assets/tilapia-salto.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Massa do Lucão — A massa especial para sua pescaria de tilápias" },
      {
        name: "description",
        content:
          "Massa do Lucão: massa para pescar tilápia, feita para a pesca de tilápias. Compre online com envio para todo o Brasil.",
      },
      { property: "og:title", content: "Massa do Lucão — Massa para pesca de tilápia" },
      {
        property: "og:description",
        content: "Massa desenvolvida especialmente para a pesca de tilápias. Envio para todo o Brasil.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { data: products } = useQuery(productsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const { data: benefits } = useQuery(benefitsQuery);
  const { data: steps } = useQuery(usageStepsQuery);
  const { data: testimonials } = useQuery(testimonialsQuery);
  const { data: gallery } = useQuery(galleryQuery);
  const { data: faqs } = useQuery(faqsQuery);

  const main = products?.[0];
  const mainPrice = main ? priceOf(main) : null;

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-8 lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative">
          <div className="absolute -left-6 top-1/2 h-40 w-1 -translate-y-1/2 bg-gradient-to-b from-primary to-transparent" />
          <span className="rise inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary ring-1 ring-primary/25">
            Pescaria de tilápias
          </span>
          <h1 className="rise mt-5 text-balance font-display text-5xl uppercase leading-[0.9] sm:text-6xl lg:text-7xl">
            Massa do Lucão
          </h1>
          <p className="rise mt-4 max-w-[42ch] text-pretty text-lg leading-snug text-muted-foreground">
            A massa especial para sua pescaria de tilápias. Prepare sua pescaria com uma massa
            desenvolvida especialmente para a pesca de tilápias.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3">
            <Link
              to="/produtos"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground ring-1 ring-primary/40 transition-colors hover:bg-primary/90"
            >
              COMPRAR AGORA
            </Link>
            <Link
              to="/sobre"
              className="rounded-full bg-surface px-6 py-3 text-sm font-semibold ring-1 ring-border backdrop-blur-sm transition-colors hover:bg-surface-strong"
            >
              CONHEÇA A MASSA
            </Link>
          </div>
          <div className="rise mt-10 flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="text-primary">★★★★★</span> Avaliações de clientes
            </span>
            <span className="hidden sm:inline">· Envio para todo o Brasil</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-secondary/40 via-transparent to-primary/25 blur-2xl" />
          <div className="floaty absolute -right-4 -top-4 h-24 w-24 rounded-full bg-secondary/30 blur-xl" />
          <div className="floaty absolute -left-5 bottom-8 h-16 w-16 rounded-full bg-primary/25 blur-lg" />
          <div className="relative overflow-hidden rounded-[1.75rem] bg-surface p-3 ring-1 ring-border backdrop-blur-md">
            <div className="sheen absolute inset-y-0 left-0 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            {settings && (
              <img
                src={settings.hero_image_url || heroImg}
                alt="Pote da Massa do Lucão em uma pedra à beira do lago"
                width={1024}
                height={1200}
                fetchPriority="high"
                decoding="async"
                className="relative aspect-[4/5] w-full rounded-[1.25rem] object-cover"
              />
            )}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-background/60 px-4 py-3 ring-1 ring-border">
              <div>
                <p className="font-display text-lg uppercase tracking-wide">
                  {main?.name ?? "Massa do Lucão"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {main?.short_description ?? "Massa especial para tilápias"}
                </p>
              </div>
              {mainPrice && (
                <p className="font-display text-2xl text-primary">{formatBRL(mainPrice.current)}</p>
              )}
            </div>
          </div>
          {main && main.stock > 0 && (
            <div className="absolute -bottom-5 -left-5 rounded-xl bg-primary px-4 py-2 ring-1 ring-primary/40">
              <p className="font-display text-sm uppercase tracking-wide text-primary-foreground">
                Em estoque
              </p>
            </div>
          )}
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(benefits ?? []).map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-surface p-5 ring-1 ring-border backdrop-blur-sm transition-transform hover:-translate-y-1"
            >
              <p className="font-display text-xl uppercase tracking-wide">{b.title}</p>
              <p className="mt-1.5 text-pretty text-sm text-muted-foreground">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE A MASSA */}
      <section id="sobre" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[1.5rem] ring-1 ring-border">
            <img
              src={settings?.about_image_url ?? tilapiaImg}
              alt="Pescaria de tilápia"
              loading="lazy"
              width={944}
              height={704}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Sobre a massa
            </span>
            <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none lg:text-5xl">
              {settings?.about_title ?? "Conheça a Massa do Lucão"}
            </h2>
            <p className="mt-4 whitespace-pre-line text-pretty text-sm leading-relaxed text-muted-foreground">
              {settings?.about_text}
            </p>
          </div>
        </div>
      </section>

      {/* COMO USAR */}
      <section id="como-usar" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Como usar
            </span>
            <h2 className="mt-3 text-balance font-display text-4xl uppercase leading-none lg:text-5xl">
              Do pacote ao Anzol
            </h2>
          </div>
          <div className="relative">
            <div className="absolute bottom-2 left-6 top-2 w-px bg-gradient-to-b from-primary via-secondary to-transparent" />
            <ol className="space-y-5">
              {(steps ?? []).map((s, i) => (
                <li key={s.id} className="flex gap-4">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-full font-display text-lg ring-1 ${
                      i === 0
                        ? "bg-primary text-primary-foreground ring-primary/40"
                        : "bg-accent text-primary ring-primary/25"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-pretty text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* PRODUTO */}
      {main && (
        <section id="produto" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-accent p-6 ring-1 ring-border backdrop-blur-md lg:p-10">
            <div className="sheen absolute inset-y-0 left-0 w-1/4 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_.9fr]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  O pote
                </span>
                <h2 className="mt-2 text-balance font-display text-4xl uppercase leading-none lg:text-5xl">
                  {main.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{main.short_description}</p>
                <ProductBuyBlock product={main} />
                <Link
                  to="/produto/$slug"
                  params={{ slug: main.slug }}
                  className="mt-4 inline-block text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  Ver todos os detalhes do produto
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <img
                  src={settings?.pot_section_image_1_url ?? linhaImg}
                  alt="Linha de pesca sobre a água ao amanhecer"
                  loading="lazy"
                  width={944}
                  height={704}
                  className="h-full min-h-0 w-full rounded-xl object-cover ring-1 ring-border"
                />
                <img
                  src={settings?.pot_section_image_2_url ?? tilapiaImg}
                  alt="Tilápia saltando na água"
                  loading="lazy"
                  width={944}
                  height={704}
                  className="h-full min-h-0 w-full rounded-xl object-cover ring-1 ring-border"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DEPOIMENTOS */}
      {(testimonials?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="font-display text-3xl uppercase lg:text-4xl">Quem já pescou com ela</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials?.map((t) => (
              <div key={t.id} className="rounded-2xl bg-surface p-5 ring-1 ring-border">
                <div className="flex items-center gap-1 text-primary">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-pretty text-sm text-muted-foreground">{t.message}</p>
                <div className="mt-4 flex items-center gap-2">
                  {t.photo_url && (
                    <img
                      src={t.photo_url}
                      alt={t.name}
                      loading="lazy"
                      className="size-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-xs font-semibold">
                    {t.name}
                    {t.location ? ` — ${t.location}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GALERIA */}
      {(gallery?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="font-display text-3xl uppercase lg:text-4xl">Galeria</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery?.map((g) => (
              <img
                key={g.id}
                src={g.image_url}
                alt={g.caption ?? "Foto da pescaria"}
                loading="lazy"
                className="aspect-square w-full rounded-xl object-cover ring-1 ring-border"
              />
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {(faqs?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <h2 className="font-display text-3xl uppercase lg:text-4xl">Perguntas frequentes</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {faqs?.map((f) => (
              <details key={f.id} className="rounded-2xl bg-surface p-4 ring-1 ring-border">
                <summary className="cursor-pointer list-none font-semibold">{f.question}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
