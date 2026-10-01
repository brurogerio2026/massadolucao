import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { settingsQuery } from "@/lib/store-queries";
import tilapiaImg from "@/assets/tilapia-salto.jpg";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Massa do Lucão" },
      {
        name: "description",
        content: "Conheça a Massa do Lucão, a massa de pesca feita para a pesca de tilápia.",
      },
      { property: "og:title", content: "Sobre a Massa do Lucão" },
      { property: "og:description", content: "A história e a proposta da Massa do Lucão." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://massadolucao.lovable.app/sobre" },
    ],
    links: [{ rel: "canonical", href: "https://massadolucao.lovable.app/sobre" }],
  }),
  component: SobrePage,
});

function SobrePage() {
  const { data: settings } = useQuery(settingsQuery);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="text-balance font-display text-4xl uppercase lg:text-5xl">
          {settings?.about_title ?? "Conheça a Massa do Lucão"}
        </h1>
        <img
          src={settings?.about_image_url ?? tilapiaImg}
          alt="Pescaria de tilápia"
          loading="lazy"
          className="mt-6 aspect-[16/9] w-full rounded-[1.5rem] object-cover ring-1 ring-border"
        />
        <p className="mt-6 whitespace-pre-line text-pretty text-sm leading-relaxed text-muted-foreground">
          {settings?.about_text}
        </p>
      </section>
    </SiteLayout>
  );
}
