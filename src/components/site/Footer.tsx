import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, Mail, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { settingsQuery } from "@/lib/store-queries";
import { onlyDigits } from "@/lib/format";

export function Footer() {
  const { data: settings } = useQuery(settingsQuery);
  const phone = onlyDigits(settings?.whatsapp ?? "");

  return (
    <footer className="mt-20 border-t border-border bg-sidebar">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-4">
        <div>
          <Logo compact />
          <p className="mt-3 text-sm text-muted-foreground">
            {settings?.store_description ?? "Massa especial para a pesca de tilápias."}
          </p>
        </div>

        <div>
          <p className="font-display text-sm uppercase tracking-wide">Loja</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/produtos" className="hover:text-primary">
                Produtos
              </Link>
            </li>
            <li>
              <Link to="/como-usar" className="hover:text-primary">
                Como usar
              </Link>
            </li>
            <li>
              <Link to="/sobre" className="hover:text-primary">
                Sobre a massa
              </Link>
            </li>
            <li>
              <Link to="/carrinho" className="hover:text-primary">
                Carrinho
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm uppercase tracking-wide">Contato</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {phone && (
              <li>
                <a
                  className="flex items-center gap-2 hover:text-primary"
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Phone className="size-4" /> WhatsApp
                </a>
              </li>
            )}
            {settings?.instagram && (
              <li>
                <a
                  className="flex items-center gap-2 hover:text-primary"
                  href={`https://instagram.com/${settings.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram className="size-4" /> Instagram
                </a>
              </li>
            )}
            {settings?.email && (
              <li>
                <a className="flex items-center gap-2 hover:text-primary" href={`mailto:${settings.email}`}>
                  <Mail className="size-4" /> {settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm uppercase tracking-wide">Institucional</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/privacidade" className="hover:text-primary">
                Política de privacidade
              </Link>
            </li>
            <li>
              <Link to="/termos" className="hover:text-primary">
                Termos de uso
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-primary">
                Painel administrativo
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings?.store_name ?? "Massa do Lucão"} · Pagamentos via
        Mercado Pago
      </div>
    </footer>
  );
}
