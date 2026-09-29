import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";

export function CartDrawer() {
  const { items, open, setOpen, setQuantity, remove, subtotal } = useCart();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fechar carrinho"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-xl uppercase">Seu carrinho</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Seu carrinho está vazio. Escolha sua massa e boa pescaria!
            </p>
          )}
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId ?? ""}`}
              className="flex gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="size-16 rounded-xl object-cover"
                />
              ) : (
                <div className="size-16 rounded-xl bg-muted" />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{formatBRL(item.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center overflow-hidden rounded-full bg-background ring-1 ring-border">
                    <button
                      type="button"
                      aria-label="Diminuir"
                      className="px-2 py-1"
                      onClick={() =>
                        setQuantity(item.productId, item.variantId, item.quantity - 1)
                      }
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Aumentar"
                      className="px-2 py-1"
                      onClick={() =>
                        setQuantity(
                          item.productId,
                          item.variantId,
                          Math.min(item.quantity + 1, Math.max(item.stock, 1)),
                        )
                      }
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remover"
                    onClick={() => remove(item.productId, item.variantId)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold">{formatBRL(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-border px-5 py-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <Link
            to="/checkout"
            onClick={() => setOpen(false)}
            className={`block rounded-full py-3 text-center text-sm font-semibold ${
              items.length === 0
                ? "pointer-events-none bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            Finalizar compra
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary"
          >
            Continuar comprando
          </button>
        </div>
      </aside>
    </div>
  );
}
