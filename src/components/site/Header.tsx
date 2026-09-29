import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";

const links = [
  { to: "/", label: "Início" },
  { to: "/produtos", label: "Produtos" },
  { to: "/sobre", label: "Sobre a Massa" },
  { to: "/como-usar", label: "Como Usar" },
  { to: "/contato", label: "Contato" },
] as const;

export function Header() {
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
        <Logo />

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-primary" }}
              className="transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir carrinho"
            className="relative grid size-10 place-items-center rounded-full bg-surface ring-1 ring-border transition-colors hover:bg-surface-strong"
          >
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
          <Link
            to="/produtos"
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground ring-1 ring-primary/40 transition-colors hover:bg-primary/90 sm:inline-flex"
          >
            Comprar agora
          </Link>
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full bg-surface ring-1 ring-border md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-background px-5 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
