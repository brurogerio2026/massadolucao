import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

export function MobileBuyBar() {
  const { count, setOpen } = useCart();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 md:hidden md:backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 rounded-full bg-surface py-3 text-center text-sm font-semibold ring-1 ring-border"
      >
        Ver carrinho{count > 0 ? ` (${count})` : ""}
      </button>
      <Link
        to="/produtos"
        className="flex-1 rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
      >
        Comprar agora
      </Link>
    </div>
  );
}
