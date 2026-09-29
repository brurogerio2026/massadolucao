import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { settingsQuery } from "@/lib/store-queries";
import { onlyDigits } from "@/lib/format";

export function WhatsAppButton() {
  const { data: settings } = useQuery(settingsQuery);
  const phone = onlyDigits(settings?.whatsapp ?? "");
  if (!phone) return null;

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(settings?.whatsapp_message ?? "")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-24 right-4 z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/50 transition-transform hover:-translate-y-1 md:bottom-6"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
