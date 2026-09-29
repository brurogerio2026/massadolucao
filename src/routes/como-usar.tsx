import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { usageStepsQuery } from "@/lib/store-queries";

export const Route = createFileRoute("/como-usar")({
  head: () => ({
    meta: [
      { title: "Como usar a Massa do Lucão" },
      {
        name: "description",
        content: "Passo a passo para preparar e usar a Massa do Lucão na pesca de tilápia.",
      },
      { property: "og:title", content: "Como usar a Massa do Lucão" },
      { property: "og:description", content: "Passo a passo da massa até o anzol." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/como-usar" },
    ],
    links: [{ rel: "canonical", href: "/como-usar" }],
  }),
  component: ComoUsarPage,
});

function ComoUsarPage() {
  const { data: steps } = useQuery(usageStepsQuery);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-4xl uppercase lg:text-5xl">Como usar a Massa do Lucão</h1>
        <ol className="mt-8 space-y-5">
          {(steps ?? []).map((s, i) => (
            <li key={s.id} className="flex gap-4 rounded-2xl bg-surface p-4 ring-1 ring-border">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary font-display text-lg text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </SiteLayout>
  );
}
