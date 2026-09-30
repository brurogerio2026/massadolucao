import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { ShippingCalculator } from "@/components/site/ShippingCalculator";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — Massa do Lucão" },
      { name: "description", content: "Revise os itens do seu pedido antes de finalizar a compra." },
      { property: "og:title", content: "Carrinho — Massa do Lucão" },
      { property: "og:description", content: "Seu carrinho na loja Massa do Lucão." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/carrinho" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/carrinho" }],
  }),
  component: CarrinhoPage,
});

function CarrinhoPage() {
  const { items, setQuantity, remove, subtotal, shipping, setShipping } = useCart();
  const shippingItems = items.map((item) => ({ productId: item.productId, quantity: item.quantity }));

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-5 py-12">
        <h1 className="font-display text-4xl uppercase">Carrinho</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-surface p-6 ring-1 ring-border">
            <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            <Link
              to="/produtos"
              className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId ?? ""}`}
                  className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-border"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      className="size-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-[140px] flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{formatBRL(item.price)}</p>
                  </div>
                  <div className="flex items-center overflow-hidden rounded-full bg-background ring-1 ring-border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Diminuir"
                      onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Aumentar"
                      onClick={() =>
                        setQuantity(
                          item.productId,
                          item.variantId,
                          Math.min(item.quantity + 1, Math.max(item.stock, 1)),
                        )
                      }
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <p className="w-24 text-right font-semibold">
                    {formatBRL(item.price * item.quantity)}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remover"
                    onClick={() => remove(item.productId, item.variantId)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-surface p-5 ring-1 ring-border">
              <ShippingCalculator items={shippingItems} initialZip={shipping?.destinationZip} selected={shipping} onSelect={setShipping} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>Frete</span>
                <span>{shipping ? (shipping.price === 0 ? "Grátis" : formatBRL(shipping.price)) : "Calcule pelo CEP"}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatBRL(subtotal + (shipping?.price ?? 0))}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/checkout"
                  className={`flex-1 rounded-full px-6 py-3 text-center text-sm font-semibold ${shipping ? "bg-primary text-primary-foreground" : "pointer-events-none bg-muted text-muted-foreground"}`}
                >
                  Finalizar compra
                </Link>
                <Link
                  to="/produtos"
                  className="flex-1 rounded-full bg-background px-6 py-3 text-center text-sm font-semibold ring-1 ring-border"
                >
                  Continuar comprando
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
