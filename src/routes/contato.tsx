import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { settingsQuery } from "@/lib/store-queries";
import { onlyDigits } from "@/lib/format";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Massa do Lucão" },
      {
        name: "description",
        content: "Fale com a Massa do Lucão pelo WhatsApp, Instagram ou e-mail.",
      },
      { property: "og:title", content: "Contato — Massa do Lucão" },
      { property: "og:description", content: "Canais de atendimento da Massa do Lucão." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const { data: settings } = useQuery(settingsQuery);
  const phone = onlyDigits(settings?.whatsapp ?? "");

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-4xl uppercase lg:text-5xl">Contato</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fale com a gente para tirar dúvidas sobre a massa, pedidos e envio.
        </p>

        <div className="mt-8 space-y-3">
          {phone && (
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent(settings?.whatsapp_message ?? "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border hover:bg-surface-strong"
            >
              <MessageCircle className="size-5 text-primary" /> WhatsApp
            </a>
          )}
          {settings?.instagram && (
            <a
              href={`https://instagram.com/${settings.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border hover:bg-surface-strong"
            >
              <Instagram className="size-5 text-primary" /> @{settings.instagram.replace("@", "")}
            </a>
          )}
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border hover:bg-surface-strong"
            >
              <Mail className="size-5 text-primary" /> {settings.email}
            </a>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
